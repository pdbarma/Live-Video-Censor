const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Iterate over each detected face and apply pixelated blur effect
    resizedDetections.forEach(face => {
      const { x, y, width, height } = face.detection.box

      // Define the pixelation block size (adjust as needed)
      const blockSize = 40;

      // Calculate the number of pixels for width and height
      const numBlocksX = width / blockSize;
      const numBlocksY = height / blockSize;

      // Draw the pixelated face
      ctx.drawImage(video, x, y, width, height, x, y, numBlocksX, numBlocksY);

      // Scale up the pixelated image to the original size, creating the pixelated effect
      ctx.drawImage(canvas, x, y, numBlocksX, numBlocksY, x, y, width, height);
    })

    // Comment out the following lines to remove the tracking overlays
    // faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})

