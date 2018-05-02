# Height Limit with Skyline
The height limit for a Longtitude-Latitude point can be obtained by <i>SkylineHeightLimitCalculator</i>

## 1. Demo
Here is the [demo link](./skylineHeightLimit.html)

Demo screenshot
![](./demo.png)
#### Tutorial of the Demo
1. Explanation of the Visualization
    * viewPoint: the center of the red tag
    * skyline: the green line
    * near: the blue triangle
    * far: the red triangle
    * blue polygon: the area
    * height limit: the red grid and blue verticle lines
2. Meaning of the Parameters
    * skylineLength: length of the skyline
    * polygonSampleResolution: sample resolution of the polygon area
    * changingViewPointLngLat: when ticked, you can click on the screen to change the viewPoint
    * viewPointTagPinLength (m): you can change the height of the viewPoint
    * fov (degree): the fov of the camera, in degree
    * height resolution (m): the height of a pixel on the far plane
    * near (m): the distance from the viewPoint to near plane
    * far (m): the distance from the viewPoint to the far plane
3. Compute and Visualize

    click on computeHeightLimit

## 2. How to use <i>SkylineHeightLimitCalculator</i>
#### Construction
```javascript
let calculator = new altizure.SkylineHeightLimitCalculator({
  sandbox: sandbox,

  polygon: new altizure.PolygonMarker(polygonMarkerOptions),
  // a PolygonMarker
  viewPoint: {lng: 116.3, lat: 42.2, alt: 100},
  // position of the eye (camera or viewing point)
  blockMarkers: [altizureProjectMarker0],
  // array of Marker used as blocks, normally some AltizureProjectMarker
  skylineLength: 512,
  // length of the computed skyline
  polygonSampleResolution: 50,
  // the resolution number used to sample the area represented by the polygon

  nearDistance: 0,
  farDistance: 0,
  // nearDistance is the distance from the near plane to the viewing point (viewPoint)
  // farDistance is the distance from the far plane to the viewing point (viewPoint)
  // nearDistance and farDistance are in meters
  // if nearDistance > 0 and farDistance > nearDistance, the settings will be used. Or, the SkylineHeightLimitCalculator class will use compute a default setting based on other inputs
  fov: 45,
  // the fov of the camera in viewing point (viewPoint)
  heightResolution: 1.0
  // the height in meters of each pixel on the far plane
})
```
#### Usage
1. computeSkyline
```javascript
calculator.computeSkyline() // the skyline is calculated
let skylinePointsInLngLatAlt = calculator.skyline
// a copy of LngLatAlt[] (the skyline)
```
2. computeHeightLimitMap
```javascript
let heightMap = calculator.computeHeightLimitMap()
// compute the height limit map in the area represented by the polygon
// calculator.computeSkyline() has to be called before this, as the height limit is calculated based on skyline
// heightMap: {
//   dimension: {width: ..., height: ...},
//   buffer: array of length width * height
// }
// value of the buffer: undefined or {lng: ..., lat: ..., alt: ...}
```
3. getHeightLimitHere
```javascript
let heightLimit = calculator.getHeightLimitHere(lnglatPoint)
// the heightLimit is a number in meters, represents the height limit at the lnglatPoint {lng: ..., lat: ...}
// calculator.computeSkyline() has to be called before this, as the height limit is calculated based on skyline
```
#### Result Visualization
1. Visualization of Skyline by <i>PolyCylinderLineMarker</i>
```javascript
let skylinePointsInLngLatAlt = calculator.skyline
let skylineMarker = new altizure.PolyCylinderLineMarker({
  sandbox: sandbox,
  points: skylinePointsInLngLatAlt,
  // decide the following options yourself  
  lineWidth: 2,
  depthTest: true,
  color: 0xff111
})
```
2. Visualization of HeightMap by <i>HeightMapMarker</i>
```javascript
let heightMap = calculator.computeHeightLimitMap()
let heightLimitMarker = new altizure.HeightMapMarker({
  sandbox: sandbox,
  heightMap: heightMap,
  // decide the following options yourself  
  lineWidth: 2
})
```
3. Visualization of near and far by <i>PolyCylinderLineMarker</i>
```javascript
let viewPoint = {
  lng: calculator.viewPoint.lng,
  lat: calculator.viewPoint.lat,
  alt: calculator.viewPoint.alt
}
let nearPts = [viewPoint].concat(calculator.near).concat([viewPoint])
// calculator.near: LngLatAlt[2]
let nearMarker = new altizure.PolyCylinderLineMarker({
  sandbox: sandbox,
  points: nearPts,
  // decide the following options yourself
  lineWidth: 1,
  depthTest: false,
  color: 0x0000ff
})
let farPts = [viewPoint].concat(calculator.far).concat([viewPoint])
// calculator.far: LngLatAlt[2]
let farMarker = new altizure.PolyCylinderLineMarker({
  sandbox: sandbox,
  points: farPts,
  // decide the following options yourself  
  lineWidth: 4,
  depthTest: false,
  color: 0xff0000
})
```