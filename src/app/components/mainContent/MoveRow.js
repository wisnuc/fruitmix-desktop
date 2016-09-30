import React, { findDOMNode, Component, PropTypes } from 'react';
import svg from '../../utils/SVGIcon';
class Row extends Component {
	constructor(props) {
		super(props);
        this.state = { show: open};
    }

	render() {
		var _this = this
		return (
			<tr>
				<td>{this.props.item.name}</td>
				<td>{this.props.item.path}</td>
				<td className='hoverLight' onClick={this.move.bind(this,this.props.item.path)}>迁移</td>
			</tr>
			)
	}

	move(path) {
		if (!this.props.samba) {
			ipc.send('move-data',path)	
		}else {
			path.forEach(item => {
				ipc.send('move-data',path)
			})
		}
		
	}

}
export default Row;