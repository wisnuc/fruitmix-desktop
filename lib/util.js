
// login api
var utils = {

	quickSort: function(arr) {
		if (arr.length <= 1) {return arr}
		let pivotIndex = Math.floor(arr.length/2)
		let pivot = arr.splice(pivotIndex,1)[0]
		let left = []
		let right = []
		for (let item of arr) {
			console.log(item.doc)
			if (item.doc.ctime > pivot.doc.ctime) {left.push(item)}
			else {right.push(item)}
		}
		return this.quickSort(left).concat([pivot], this.quickSort(right));
	},
};

module.exports = utils