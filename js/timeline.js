function setDefaultValue(vari, defaultValue) {
  if (!vari) {
    return defaultValue
  }
  const defautlProps = Object.getOwnPropertyNames(defaultValue)
  for (let idx in defautlProps) {
    const prop = defautlProps[idx]
    if (!vari.hasOwnProperty(prop)) {
      vari[prop] = defaultValue[prop]
    }
  }
  return vari
}

// https://en.wikipedia.org/wiki/Haversine_formula
function greatCircleDistance(lat0, lng0, lat1, lng1){
    const radius = 6378.137
    const deltaLat = (lat1 - lat0) * Math.PI / 180
    const deltaLng = (lng1 - lng0) * Math.PI / 180
    const havLat = (1 - Math.cos(deltaLat)) * 0.5
    const havLng = (1 - Math.cos(deltaLng)) * 0.5
    const havDR = havLat + Math.cos(lat0 * Math.PI / 180)
                           * Math.cos(lat1 * Math.PI / 180)
                           * havLng
    const theta = 2 * Math.atan2(Math.sqrt(havDR), Math.sqrt(1 - havDR))
    return radius * theta * 1000
}

function timelineLayout(sandbox, projects, options) {
  if (!sandbox) {
    console.log('No sandbox to render the grid timeline')
    return
  }
  if (!projects || projects.length == 0) {
    console.log('empty project')
    return
  }

  options = setDefaultValue(options, { cameraPos: {}, projOffset: {}, labelOffset: {}, defaultVisible: true, title: ''})

  options.cameraPos = setDefaultValue(options.cameraPos, {
    lng: 113.94255600866971,
    lat: 22.538388886344876,
    alt: 1020,
    north:-27.271585092584015,
    tilt:74.7023627906978
  })

  // console.log(options.cameraPos)

  options.projOffset = setDefaultValue(options.projOffset, {
    lng: 0.009,
    lat: 0.006
  })

  // console.log(options.projOffset)

  options.labelOffset = setDefaultValue(options.labelOffset, {
    lng: -0.004,
    lat: 0
  })

  // console.log(options.labelOffset)


  const centerLat = options.cameraPos.lat
  const centerLng = options.cameraPos.lng
  const cameraAlt = options.cameraPos.lat
  const projLatOffset = options.projOffset.lat // in y dir
  const projLngOffset = options.projOffset.lng // in x dir
  const labelLatOffset = options.labelOffset.lat
  const labelLngOffset = options.labelOffset.lng

  console.log('option.cameraPos', options.cameraPos)

  if (options.cameraPos.lat && options.cameraPos.lng && options.cameraPos.alt) {
    sandbox.camera.flyTo(options.cameraPos)
  } else {
    console.log('options.cameraPos is not fully ready')
  }


  const projCount = projects.length
  const projCol = Math.ceil(Math.sqrt(projCount))
  const projRow = projCol

  console.log(projCount, projCol, projRow)

  const projLatOrigin = centerLat - projRow * 0.5 * projLatOffset
  const projLngOrigin = centerLng - projCol * 0.5 * projLngOffset
  let projectEntities = []
  let itemsLoaded = []

  for (let i = 0; i < projects.length; ++i) {
    projects[i] = setDefaultValue(projects[i], {ref: {lng: 0, lat: 0, alt: 0}})
    console.log(projects[i])
  }

  let ref = null

  for (let i = 0; i < projRow; ++i) {
    for (let j = 0; j < projCol; ++j) {
      let idx = i*projCol + j

      if (idx >= projCount) {
        continue
      }

      const proj = projects[idx]

      if (!ref) {
        ref = proj.ref
      }

      const projLat = projLatOrigin + i * projLatOffset - (proj.ref.lat - ref.lat)
      const projLng = projLngOrigin + j * projLngOffset - (proj.ref.lng - ref.lng)
      const projAlt = - (proj.ref.alt - ref.alt)

      // console.log(proj.ref.lat - ref.lat, proj.ref.lng - ref.lng, proj.ref.alt - ref.alt)

      const labelLat = projLat + labelLatOffset
      const labelLng = projLng + labelLngOffset

      itemsLoaded.push(new Promise((resolve, reject) => {
        let projPose = undefined
        if (options.cameraPos.lat && options.cameraPos.lng && options.cameraPos.alt) {
          projPose = {
            position: {
              lng: projLng,
              lat: projLat,
              alt: projAlt
            }
          }
        }
        sandbox.add('AltizureProjectMarker', {
          pid: proj.pid,
          visible: options.defaultVisible//,
          // pose: projPose
        }).then((projectMarker) => {
          projectMarker.visible = options.defaultVisible
          let labelMarker = null
          if (options.cameraPos.lat && options.cameraPos.lng && options.cameraPos.alt) {
            labelMarker = new altizure.TextTagMarker({
              // text string
              text: proj.text,
              // text style
              textStyle: {
                fillStyle: 'rgb(255, 255, 255)',
                font: 'normal 500 24px Arial',
                outlineWidth: 2,
                outlineStyle: 'rgb(0, 0, 0)'
              },

              // icon position
              position: {
                "lng": labelLng,
                "lat": labelLat,
                "alt": 0
              },
              // scene
              sandbox: sandbox,
              visible: options.defaultVisible,
              scale: 6 // icon size
            })
          }

          projectEntities[idx] = {proj: projectMarker,
            label: labelMarker,
            position: {
              lng: projLng,
              lat: projLat,
              alt: projAlt
            },
            lablelPosition: {
              "lng": labelLng,
              "lat": labelLat,
              "alt": 0
            }
          }
          resolve({proj: projectMarker, label: labelMarker})
        }).catch((e) => {
          console.log(e)
          reject(e)
        })
      }))
    }
  }

  return Promise.all(itemsLoaded).then((res) => {
    const mainlabelOffset = Math.max(Math.abs(labelLngOffset), Math.abs(labelLatOffset))
    if (options.cameraPos.lat && options.cameraPos.lng && options.cameraPos.alt) {
      let titleLabel = new altizure.TextTagMarker({
        // text string
        text: options.title,
        // text style
        textStyle: {
          fillStyle: 'rgb(255, 255, 255)',
          font: 'normal 500 24px Arial',
          outlineWidth: 2,
          outlineStyle: 'rgb(0, 0, 0)'
        },

        // icon position
        position: {
          "lng": centerLng - mainlabelOffset * ((projLngOffset > 0) ? 1 : 0),
          "lat": projLatOrigin - mainlabelOffset * ((Math.abs(labelLatOffset) > 0) ? 1.3 : 1), // offset in lat direction
          "alt": 0
        },
        // scene
        sandbox: sandbox,
        scale: 8 // icon size
      })
    }

    return projectEntities
  }).catch((e) => {
    console.log('Error in loading models')
  })
}
