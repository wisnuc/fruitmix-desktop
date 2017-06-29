import React from 'react'
import Debug from 'debug'
import Star from 'material-ui/svg-icons/toggle/star'
import FileDownload from 'material-ui/svg-icons/file/file-download'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:deviceinfo')

const formatNumber = num => ((num > 999999)
  ? `${(num / 1000000).toFixed(1)}M`
  : (num > 999)
  ? `${(num / 1000).toFixed(1)}K` : num)

class Detail extends React.PureComponent {

  constructor(props) {
    super(props)

    this.toggleState = (op) => {
      this.setState({ [op]: !this.state[op] })
    }

    this.closeDialog = (op) => {
      this.setState({ [op]: '' })
    }
  }

  render() {
    const { app, appstore, primaryColor, imgURL } = this.props
    const repo = appstore.result.find(a => a.appname === app.recipe.appname).components[0].repo

    debug('renderDetail', app, repo)

    return (
      <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
        {/* left panel */}
        <div style={{ height: 264, width: 160 }} >
          {/* image */}
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              height={128}
              width={128}
              src={`${imgURL}${app.recipe.components[0].imageLink}`}
              alt={app.recipe.appname}
            />
          </div>

          {/* name, star, download */}
          <div style={{ marginLeft: 24, color: 'rgba(0,0,0,0.54)', marginTop: -4 }}>
            <div style={{ height: 24, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.87)' }}>
              { app.recipe.appname }
            </div>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 14 }}>
              <Star color="rgba(0,0,0,0.54)" style={{ width: 16, marginRight: 8 }} />
              { repo.star_count }
            </div>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 14 }}>
              <FileDownload color="rgba(0,0,0,0.54)" style={{ width: 16, marginRight: 8 }} />
              { formatNumber(repo.pull_count) }
            </div>

            <div style={{ height: 8 }} />

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: -16 }}>
              <FlatButton
                primary
                label={'卸载'}
                onTouchTap={() => {}}
              />
            </div>
          </div>
        </div>

        {/* divider */}
        <div style={{ width: 8 }} />
        <div style={{ width: 8 }} />
        <div style={{ height: 176, width: 3, backgroundColor: primaryColor }} />
        <div style={{ width: 8 }} />

        {/* right panel */}
        <div style={{ minWidth: 400, color: 'rgba(0,0,0,0.54)', margin: 24 }}>
          <div style={{ height: 24, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.87)' }}>
            { repo.description ? repo.description : repo.name }
          </div>
          <div style={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 14 }}>
            应用简介
          </div>
          <div style={{ height: 24 }} />

          <div style={{ height: 24, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.87)' }}>
            { repo.user }
          </div>
          <div style={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 14 }}>
            开发者
          </div>
          <div style={{ height: 24 }} />

          <div style={{ height: 24, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.87)' }}>
            dockerhub
          </div>
          <div style={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 14 }}>
            应用来源
          </div>
        </div>
      </div>
    )
  }
}

export default Detail
