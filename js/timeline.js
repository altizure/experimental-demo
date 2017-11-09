function setDefaultValue(vari, defaultValue) {
  if (!vari) {
    return defaultValue
  }
  const defautlProps = Object.getOwnPropertyNames(defaultValue)
  for (let prop in defautlProps) {
    if (!vari.hasOwnProperty(prop)) {
      vari[prop] = defaultValue[prop]
    }
  }
  return vari
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

  console.log(options.cameraPos)

  options.projOffset = setDefaultValue(options.projOffset, {
    lng: 0.009,
    lat: 0.006
  })

  console.log(options.projOffset)

  options.labelOffset = setDefaultValue(options.labelOffset, {
    lng: -0.004,
    lat: 0
  })

  console.log(options.labelOffset)


  const centerLat = options.cameraPos.lat
  const centerLng = options.cameraPos.lng
  const cameraAlt = options.cameraPos.lat
  const projLatOffset = options.projOffset.lat // in y dir
  const projLngOffset = options.projOffset.lng // in x dir
  const labelLatOffset = options.labelOffset.lat
  const labelLngOffset = options.labelOffset.lng

  sandbox.camera.flyTo(options.cameraPos)

  const projCount = projects.length
  const projCol = Math.ceil(Math.sqrt(projCount))
  const projRow = projCol

  console.log(projCount, projCol, projRow)

  const projLatOrigin = centerLat - projRow * 0.5 * projLatOffset
  const projLngOrigin = centerLng - projCol * 0.5 * projLngOffset
  let projectEntities = []
  let itemsLoaded = []

  for (let proj in projects) {
    proj = setDefaultValue(proj, {ref: {lng: 0, lat: 0, alt: 0}})
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

      console.log(proj.ref.lat - ref.lat, proj.ref.lng - ref.lng, proj.ref.alt - ref.alt)

      const labelLat = projLat + labelLatOffset
      const labelLng = projLng + labelLngOffset

      itemsLoaded.push(new Promise((resolve, reject) => {
        sandbox.add('AltizureProjectMarker', {
          pid: proj.pid,
          visible: options.defaultVisible,
          pose: {
            position: {
              lng: projLng,
              lat: projLat,
              alt: projAlt
            }
          }
        }).then((projectMarker) => {
          let labelMarker = new altizure.TextTagMarker({
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

          projectEntities[idx] = {proj: projectMarker, label: labelMarker}
          resolve({proj: projectMarker, label: labelMarker})
        })
      }))
    }
  }

  return Promise.all(itemsLoaded).then((res) => {

    const mainlabelOffset = Math.max(Math.abs(labelLngOffset), Math.abs(labelLatOffset))
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

    return projectEntities
  })
}
