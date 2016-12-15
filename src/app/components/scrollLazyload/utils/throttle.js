export default (handler, delay, mustDelay) => {
	let timer, startTime;

	return function(...args) {
  	const currTime = Date.now();
  	clearTimeout(timer);

  	if (!startTime)
  	  startTime = currTime;

  	// 当前执行时间超过了上一次执行时间，就执行handler
  	if (mustDelay && currTime - startTime >= mustDelay) {
  	  startTime = currTime;
  	  handler.apply(this, args);
  	}

  	timer = setTimeout(() => {
  	  handler.apply(this, args);
  	}, delay);
	}
};
