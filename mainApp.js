'use strict';

// play with async stuff: ajax, promises, async, await etc.

// load image using ajax
const addImageAjax = (url, element) => {
	const request = new XMLHttpRequest();
	request.open('GET', url);
	request.responseType = 'blob';
	request.addEventListener('load', () => {
		if (request.status == 200) {
			const blob = new Blob([request.response], { type: 'image/png' });
			const img = document.createElement('img');
			img.src = URL.createObjectURL(blob);
			element.appendChild(img);
		} else {
			console.log(`${request.status}: ${request.statusText}`);
		}
	});
	request.addEventListener('error', event => console.log('Network error'));
	request.send();
}

// very basic idea of a promise
const promiseBasic = new Promise((resolve, reject) => {
	// Body of the executor function
	const callback = (args) => {
		// calc success
		// . . .
		success ? resolve("result") : reject("reason");
	}
	//invokeTask(callback);
});

// time delay promise
const promiseDelay = (result, delay = 250) => {
	//console.log("setting up promiseDelay with " + result + " " + delay);
	return new Promise((resolve, reject) => {
		const callback = () => {
			//console.log("resolved!!");
			resolve(result);
		}
		setTimeout(callback, delay);
	});
}


// load image promise
const promiseLoadImage = url => {
	//if (url === undefined) { // resolve right away without a callback
	//	return Promise.resolve(brokenImage);
	//}
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		const callback = () => {
			if (request.status == 200) {
				const blob = new Blob([request.response], { type: 'image/png' });
				const img = document.createElement('img');
				img.src = URL.createObjectURL(blob);
				resolve(img);
			} else {
				reject(Error(`${request.status}: ${request.statusText}, ${url}`));
			}
		}
		request.open('GET', url);
		request.responseType = 'blob';
		request.addEventListener('load', callback);
		request.addEventListener('error', event => reject(Error('Network error')));
		request.send();
	});
}

// load image promise with a delay, test nested async functions
const promiseLoadImageDelay = async(url, delay) => {
	const result = await promiseDelay(url, delay);
	console.log("promiseLoadImageDelay promiseDelay result = " + result);
	return promiseLoadImage(url);
}

function getImageName(i) {
	// very specialized, 0 <= i <= 20,  21 images, ray tracing examples
	// example: input 13, output '../sprites2/pics/take0013.jpg'
	const str = "take" + i.toString().padStart(4, "0");
	const imgDir = '../sprites2/pics/';
	return imgDir + str + '.jpg';

}

function run() {
	console.log("--------------------");
	console.log("begin async tests");

	// switches
	const doImage = false;
	const doAjax = false;
	const doPDelay = false;
	const doPImage = false;
	const doPChain1 = false;
	const doPChain2 = false;
	const doPFetch = false;
	const synchronous1 = false;
	const synchronous2 = false;
	const doBigChain = false;
	const promiseAll = false;
	const asyncAwait1 = false;
	const asyncAwait2 = true;

	// where images go on page
	const imgDiv = document.getElementById('images');

	// very basic, doImage
	if (doImage) {
		const numPics = 20;
		for (let i = 0; i < numPics; ++i) {
			const img = new Image(100, 200);
			img.src = getImageName(i);
			imgDiv.appendChild(img); 
		}
	}

	// basic XMLHttpRequest, ajax
	if (doAjax) {
		const numPics = 20;
		for (let i = 0; i < numPics; ++i) {
			addImageAjax(getImageName(i), imgDiv);
		}
	}

	// make promise with time delay
	if (doPDelay) {
		const pDelay = promiseDelay(1234, 1000);
		pDelay.then(id => console.log(id)); // log the result when ready
	}

	// make promise with XMLHttpRequest, 1 image
	if (doPImage) {
		const i = 20;
		//const i = 25;
		const pLoadImage = promiseLoadImage(getImageName(i));
		pLoadImage.then(img => {
			imgDiv.appendChild(img); 
		}); // Append the image when ready
	}

	//chain promises, 2 images
	if (doPChain1) {
		const promise1 = promiseLoadImage(getImageName(0));
		const promise2 = promise1.then(img => {
			imgDiv.appendChild(img);
			return promiseLoadImage(getImageName(1)); // Another promise
		});
		promise2.then(img => {
			imgDiv.appendChild(img);
		});
	}

	//chain promises, less variables, 3 images
	if (doPChain2) {
		promiseLoadImage(getImageName(0)).then(
		img => {
			imgDiv.appendChild(img);
			return promiseLoadImage(getImageName(1)); // Another promise
		}).then(img => {
			imgDiv.appendChild(img);
			return promiseLoadImage(getImageName(2)); // Another promise
		}).then(img => {
			imgDiv.appendChild(img);
		});
	}

	// fetch
	if (doPFetch) {
		fetch('/engw/engw3dtest/index.html')
			.then(response => response.text())
			.then(console.log);
	}

	// some synchronous calls
	if (synchronous1) { // 2 images
		promiseLoadImage(getImageName(10)) // Asynchronous
			.then(img => imgDiv.appendChild(img)) // Synchronous
			.then(() => promiseLoadImage(getImageName(11))) // Asynchronous
			.then(img => imgDiv.appendChild(img)); // Synchronous
	}
	if (synchronous2) { // 2 images
		// cleaner looking
		Promise.resolve()
			.then(() => promiseLoadImage(getImageName(12))) // Asynchronous
			.then(img => imgDiv.appendChild(img)) // Synchronous
			.then(() => promiseLoadImage(getImageName(13))) // Asynchronous
			.then(img => imgDiv.appendChild(img)) // Synchronous
			;
	}

	// big chain with sync and Async calls
	if (doBigChain) {
		const numPics = 20;
		let p = Promise.resolve();
		for (let i = 0; i < numPics; ++i) {
		//for (let i = 2; i <= 2; ++i) {
			//const j = i ==2 ? 47 : i; // break image 2 for testing errors
			const j = i;
			const str = getImageName(j);
			p = p.then(() => promiseDelay(str, 125));//.then(console.log));
			p = p.then(() => promiseLoadImage(str));
			console.log("promiseLoadImage = " + str);
			p = p.then(
				// good
				img => imgDiv.appendChild(img)
				// bad
				//,reason => {console.log({reason});
				//	imgDiv.appendChild(brokenImage);
				//}
			).catch(
				reason => {
					console.log({reason});
					imgDiv.appendChild(brokenImage);
				}
			);
		}
		p.then(() => console.log("done!!!"));
	}

	// iterable promises
	if (promiseAll) {
		const numPics = 20;
		const promises = [];
		for (let i = 0; i < numPics; ++i) {
			promises.push(promiseLoadImage(getImageName(i)));
			promises.push(promiseDelay(i * 13, 1000));
		}
		Promise.all(promises)
		.then(images => { 
			for (const img of images) {
				const imgType = typeof img;
				if (imgType === 'object') {
					imgDiv.appendChild(img);
				}
			}
		});
	}

	// async await 1
	if (asyncAwait1) {
		(async function() {
			const numPics = 20;
			for (let i = 0; i < numPics; ++i) {
				const j = i ==2 ? 47 : i; // break image 2 for testing errors
				//const j = i;
				let val = await promiseDelay(i * 7, 100);
				console.log(val); // use result
				try {
					const img = await promiseLoadImage(getImageName(j));
					imgDiv.appendChild(img); // use result
				} catch (reason) {
					console.log(reason);
					imgDiv.appendChild(brokenImage); // use alt result for error
				}
			}
		}
		)();
	}

	// async await 2
	if (asyncAwait2) {
		(async function() {
			const numPics = 20;
			for (let i = 0; i < numPics; ++i) {
				const j = i ==2 ? 47 : i; // break image 2 for testing errors
				console.log("pic " + j); // use result
				//const j = i;
				try {
					const img = await promiseLoadImageDelay(getImageName(j));
					imgDiv.appendChild(img); // use result
				} catch (reason) {
					console.log(reason);
					imgDiv.appendChild(brokenImage.cloneNode()); // use alt result for error
				}
			}
			console.log("ALL DONE!!!");
			for (let i = 0; i < numPics; ++i) {
				const j = i ==2 ? 47 : i; // break image 2 for testing errors
				console.log("pic " + j); // use result
				//const j = i;
				try {
					const img = await promiseLoadImageDelay(getImageName(j), 25);
					imgDiv.appendChild(img); // use result
				} catch (reason) {
					console.log(reason);
					imgDiv.appendChild(brokenImage.cloneNode()); // use alt result for error
				}
			}
		}
		)();
	}

	// all done
	console.log("done async tests");
}

const brokenImage = new Image(100, 200);
brokenImage.src = "../sprites2/pics/light.jpg";
//document.body.appendChild(brokenImage);

run();
