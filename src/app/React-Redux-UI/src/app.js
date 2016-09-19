/**
  入口文件
**/

'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import storeCreator from 'store';
import * as actionCreator from 'action/actionCreator';
import { preload } from 'utils';

/**
  组件
**/

import Button from 'partials/Button';
import Checkbox from 'partials/Checkbox';
import Radio from 'partials/Radio';
import CheckboxGroup from 'partials/CheckboxGroup';
import Input from 'partials/Input';
import Textarea from 'partials/Textarea';
import Mask from 'partials/Mask';
import Drag from 'partials/Drag'
import Dialog from 'components/Popup/Dialog';
import Slide from 'components/transitions/Slide';
import Carousel from 'components/transitions/Carousel';
import ImageSwipe from 'components/transitions/ImageSwipe';

/**
  全局css
**/

import 'themes/reset';

// 初始化state
const initialState = {
		buttonDisabled: false,
		checkboxChecked: false,
		radioChecked: false,
		checkboxGroupDefaultValues: 'w|j|x'
};

// 定义store
const store = storeCreator(initialState);

// 定义绑定dispatch后的action
const action = bindActionCreators(actionCreator, store.dispatch);

/**
  渲染 Button Component
**/

const renderButton = () => {
	const state = store.getState();

  ReactDOM.render(
		<Button
			type='button'
			className='btn btn-info download'
			clickEventHandle={ function () { alert('挖掘机'); } }
			text='下一步'
			disabled={ state.buttonDisabled === void 0 ? false : state.buttonDisabled  }
			multied={ true }
			{ ...action }>
		</Button>,
		document.getElementById('app')
	)
};

/**
  渲染 Checkbox Component
**/

const renderCheckbox = () => {
	const state = store.getState();

	ReactDOM.render(
		<Checkbox
			className='cbox'
			changeEventHandle={ function (value, checked) { console.log(value + ' : ' + checked); } }
			value='boy'
			text='男孩'
			checked={ state.checkboxChecked === void 0 ? false : state.checkboxChecked }
			{ ...action }>
		</Checkbox>,
		document.getElementById('app')
	);
};

/**
  渲染 Radio Component
**/

const renderRadio = () => {
	const state = store.getState();

	ReactDOM.render(
		<Radio
			className="radio"
			changeEventHandle = { function (value, checked) { console.log(value + ' : ' + checked); } }
			value='girl'
			checked={ state.radioChecked === void 0 ? false : state.radioChecked }
			text='女孩'
			{ ...action } >
		</Radio>,
		document.getElementById('app')
	);
};

/**
  渲染 CheckboxGroup Component
**/

const renderCheckboxGroup = () => {
	const state = store.getState();
	//console.log(state, 'ggg');
	ReactDOM.render(
		<CheckboxGroup
			changeEventHandle={ function (values) { console.log(values, '选中的value'); } }
			defaultCheckedValues={ state.checkboxGroupDefaultValues }
			textTpl='{text}({value})'
			{ ...action }
			data={ [
			  { value: 'w', text: '挖掘机1' },
				{ value: 'j', text: '挖掘机2' },
				{ value: 'x', text: '挖掘机3' },
				{ value: 'o', text: '挖掘机4' },
				{ value: 'b', text: '挖掘机5' }
			] }
			// data={ {
			// 	w: '挖掘机1',
			// 	j: '挖掘机2',
			// 	x: '挖掘机3',
			// 	o: '挖掘机4',
			// 	b: '挖掘机5'
			// } }
		>
		</CheckboxGroup>,
		document.getElementById('app')
	);
};

/**
  渲染 Input Component
**/

const renderInput = () => {
	const state = store.getState();

	ReactDOM.render(
	  <Input
			type="number"
		  className="input"
			placeholder="请输入用户名"
			isValidateValue={ false }
			changeEventHandle={ function (value) { console.log(value); } }
			value={ state.inputGetValue }
			{ ...action }>
		</Input>,
		document.getElementById('app')
	);
};

/**
  渲染 TextArea
**/

const renderTextArea = () => {
	const state = store.getState();

	ReactDOM.render(
		<Textarea
		  className="wjj"
			rows={ state.textareaAdaptRows }
			changeEventHandle={ function (value) { console.log(value); } }
			textareaAdaptRows={ action.textareaAdaptRows }>
		</Textarea>,
		document.getElementById('app')
	);
};

/**
  渲染 Dialog
**/

const renderDialog = () => {
  ReactDOM.render(
		<Dialog
		  width={ 450 }
			title="分享设置"
			titleHeight={ 55 }>
		</Dialog>,
		document.getElementById('app')
	);
}

/**
  渲染 Slide
**/

const renderSlide = () => {
	const spreadItems = [
		{
			title: '文件',
			content: [
				{ value: 0, text: '所有文件' },
				{ value: 1, text: '分享给我' },
				{ value: 2, text: '我的分享' },
				{ value: 3, text: '上传/下载' },
				{ value: 4, text: 'Transmission的文件' },
				{ value: 5, text: 'OwnCloud的文件' }
			]
		}, {
			title: '照片',
			content: [
				{ value: 0, text: '所有照片' },
				{ value: 1, text: '相册' },
				{ value: 2, text: '视频' },
				{ value: 3, text: '分享' }
			]
		}
	];

	ReactDOM.render(
		<Slide
		  width={ 230 }
		  spreadItems={ spreadItems }
			defaultSelectedSpreadIndexs="0">
		</Slide>,
		document.getElementById('app')
	);
}

/**
  渲染 Carousel
**/
const renderCarousel = () => {
  ReactDOM.render(
		<Carousel
		  width={ 905 }
			height={ 75 }
			data={ [
				{ text: '1' },
				{ text: '2' },
				{ text: '3' },
				{ text: '4' },
				{ text: '5' },
				{ text: '6' },
				{ text: '7' },
				{ text: '8' },
				{ text: '9' },
				{ text: '10' },
				{ text: '11' },
				{ text: '12' },
				{ text: '13' },
				{ text: '14' },
				{ text: '15' },
				{ text: '16' },
				{ text: '17' },
				{ text: '18' },
				{ text: '19' }
			] }>
		</Carousel>,
		document.getElementById('app')
	);
}

const renderImageSwipe = () => {
	preload([
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
		'http://s2.mogucdn.com/p2/160809/63653807_847g1dea78ek6kie3j9f0hjj71b7h_800x533.jpg_468x468.jpg',
	], 5000).then(imgList => {
		ReactDOM.render(
			<ImageSwipe
				width={ 800 }
				height={ 600 }
				imgList={ imgList }>
			</ImageSwipe>,
			document.getElementById('app')
		);
	});
};

const renderMask = () => {
	ReactDOM.render(
		<Mask />,
		document.getElementById('app')
	);
};

// const renderDrag = () => {
// 	ReactDOM.render(
// 		<Drag
// 		  onDrop={ function (e) { console.log(e); } }>
// 			<div style={{ width: 100, height: 100, backgroundColor: 'green' }}></div>
// 		</Drag>	,
// 		document.getElementById('app')
// 	)
// };
//
// renderDrag();
//renderMask();

//renderImageSwipe();
renderCarousel();
//renderSlide();
//render();
//renderCheckbox();
//renderRadio();
//renderCheckboxGroup();
//renderInput();
//renderTextArea();
//renderDialog();

//store.subscribe(renderSlide);
