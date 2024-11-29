<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-9 text-white">
    <q-page-container>
      <q-page class="flex flex-center column q-pa-md">
        <h1 class="text-h3 q-mb-md text-center">AI Item Identifier</h1>
        
        <div v-if="!isInitialized" class="text-center q-pa-md">
          <p v-if="initializationError" class="text-negative text-h6">
            Error: {{ initializationError }}
          </p>
          <p v-else class="text-h6">Initializing...</p>
        </div>
        
        <div v-else class="full-width" style="max-width: 640px;">
          <div class="camera-container q-mb-md" style="position: relative; width: 100%; padding-top: 75%;">
            <video 
              ref="video" 
              id="video" 
              autoplay 
              playsinline 
              muted 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
            ></video>
            <canvas 
              ref="canvas" 
              id="canvas" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            ></canvas>
          </div>
          
          <div class="text-center">
            <q-btn 
              @click="toggleClassification" 
              :color="isClassifying ? 'negative' : 'primary'"
              :label="isClassifying ? 'Stop Identification' : 'Start Identification'"
              class="q-py-sm q-px-md text-subtitle1"
              :icon="isClassifying ? 'stop' : 'camera_alt'"
              :aria-label="isClassifying ? 'Stop item identification' : 'Start item identification'"
              size="lg"
            />
          </div>
          
          <div v-if="highConfidencePrediction" class="q-mt-md text-center">
            <h2 class="text-h4">{{ highConfidencePrediction.class }}</h2>
            <p class="text-subtitle1">Confidence: {{ (highConfidencePrediction.score * 100).toFixed(2) }}%</p>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { Camera, AudioFeedback, ImageClassifier, Renderer } from './modules'

export default {
  name: 'App',
  setup() {
    const $q = useQuasar()
    const video = ref(null)
    const canvas = ref(null)
    const isClassifying = ref(false)
    const classifiedObjects = ref([])
    const isInitialized = ref(false)
    const initializationError = ref(null)
    const confidenceThreshold = 0.6

    const highConfidencePrediction = computed(() => {
      return classifiedObjects.value.find(obj => obj.score > confidenceThreshold) || null
    })

    let camera, imageClassifier, renderer, audioFeedback
    let animationFrameId = null
    let lastAnnouncedPrediction = null

    const initialize = async () => {
      try {
        camera = new Camera()
        await camera.setup()

        imageClassifier = new ImageClassifier()
        await imageClassifier.loadModel()

        audioFeedback = new AudioFeedback()

        isInitialized.value = true
        showNotification('AI Item Identifier initialized successfully')
      } catch (error) {
        console.error('Initialization error:', error)
        initializationError.value = error.message
      }
    }

    onMounted(async () => {
      await initialize()
      if (video.value && camera) {
        video.value.srcObject = camera.getVideoElement().srcObject;
      }
      if (canvas.value) {
        renderer = new Renderer(canvas.value)
      } else {
        console.error('Canvas element not found')
        initializationError.value = 'Failed to initialize renderer'
        isInitialized.value = false
      }
    })

    onUnmounted(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (camera) {
        camera.stop()
      }
    })

    const classifyObjects = async () => {
      if (!isClassifying.value || !isInitialized.value) return

      try {
        if (!camera.isVideoReady()) {
          console.log('Video not ready, waiting...')
          animationFrameId = requestAnimationFrame(classifyObjects)
          return
        }

        const videoElement = camera.getVideoElement()
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          console.log('Video dimensions are zero, waiting...')
          animationFrameId = requestAnimationFrame(classifyObjects)
          return
        }

        const predictions = await imageClassifier.classify(videoElement)
        classifiedObjects.value = predictions

        if (renderer) {
          renderer.render(highConfidencePrediction.value ? [highConfidencePrediction.value] : [])
        }

        if (highConfidencePrediction.value) {
          if (lastAnnouncedPrediction !== highConfidencePrediction.value.class) {
            audioFeedback.updateAndSpeak([highConfidencePrediction.value])
            lastAnnouncedPrediction = highConfidencePrediction.value.class
          }
        } else {
          lastAnnouncedPrediction = null
        }

        animationFrameId = requestAnimationFrame(classifyObjects)
      } catch (error) {
        console.error('Classification error:', error)
        isClassifying.value = false
        showNotification('Classification error occurred')
      }
    }

    const toggleClassification = () => {
      if (!isInitialized.value) {
        showNotification('System not initialized. Please wait.')
        return
      }
      isClassifying.value = !isClassifying.value
      if (isClassifying.value) {
        classifyObjects()
        showNotification('Started item identification')
      } else {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        classifiedObjects.value = []
        lastAnnouncedPrediction = null
        if (renderer) {
          renderer.render([]) // Clear the canvas
        }
        showNotification('Stopped item identification')
      }
    }

    const showNotification = (message) => {
      $q.notify({
        message: message,
        color: 'info',
        position: 'top',
        timeout: 2000
      })
    }

    return {
      video,
      canvas,
      toggleClassification,
      isClassifying,
      highConfidencePrediction,
      isInitialized,
      initializationError
    }
  }
}
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.6;
}

.camera-container {
  border: 4px solid #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.q-btn {
  font-weight: bold;
}
</style>