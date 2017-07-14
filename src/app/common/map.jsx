import React from 'react'

class Map extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      success: false
    }

    this.fire = () => {
      this.setState({ success: true }, this.getMap)
    }

    this.getMap = () => {
      /* 已知点坐标 */
      const lnglatXY = [this.props.longitude, this.props.latitude]

      const map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        zoom: 15,
        center: lnglatXY
      })

      const geocoderCallBack = (data) => {
        console.log('address', data.regeocode)
        /* 返回地址描述 */
        const compo = data.regeocode.addressComponent
        const address = `${compo.province} ${compo.district}`
        if (this.props.resultId) {
          document.getElementById(this.props.resultId).innerHTML = address
        }
      }

      /* 逆地理编码 */
      const regeocoder = () => {
        const geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: 'all'
        })
        geocoder.getAddress(lnglatXY, (status, result) => {
          console.log(status, result)
          if (status === 'complete' && result.info === 'OK') {
            geocoderCallBack(result)
          }
        })
        /* 加点 */
        const marker = new AMap.Marker({
          map,
          position: lnglatXY
        })
        // map.setFitView()
      }
      regeocoder()
    }
  }

  componentWillMount() {
    setTimeout(() => {
      const script = document.createElement('script')
      script.src = 'http://webapi.amap.com/maps?v=1.3&key=db48eaf98740f0ea550863860b3aab81&plugin=AMap.Geocoder'
      script.async = true
      script.onload = this.fire
      document.body.appendChild(script)
    }, 500)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState || nextProps.resultId !== this.props.resultId)
  }

  componentDidUpdate() {
    if (this.state.success) this.getMap()
  }

  render() {
    console.log('map render')
    const height = this.props.height || 360
    const width = this.props.height || 360
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {
          this.state.success &&
            <div style={{ height, width }} id="mapContainer" />
        }
      </div>
    )
  }
}

export default Map
