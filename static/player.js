document.addEventListener("DOMContentLoaded", function () {

	const search = new URLSearchParams(window.location.search);

	const user = search.get('user');
	const room = search.get('room');

	let isOwner = true;

	if (!user || !room) {
		window.location.href = window.location.origin;
	}

	const socket = io();

	socket.on('joined', (msg) => {
		if (!msg) {
			alert('Party has ended or doesn\'t exist\nRequest or create new Party ID');
			window.location.href = window.location.origin;
		}
		if (user != msg.owner) {
			player.classList.add('no-controls');
			isOwner = false;
		}

		document.querySelector('#room-name').textContent = msg.name;
		document.querySelector('#room-owner').textContent = msg.owner;
		document.querySelector('#room-code').textContent = msg.id;
	});

	socket.emit('join', {
		room, user
	});

	// Player Def

	const page = document.querySelector('.player-page')
	const player = document.querySelector('#video-player')
	const video = document.querySelector('#video');
	const videoWrapper = document.querySelector('#video-wrapper');
	const progress = document.querySelector('#progress-bar .progress');
	const playBtn = document.querySelector('#play-btn');
	const forBtn = document.querySelector('#for-btn');
	const revBtn = document.querySelector('#rev-btn');
	const fullScrBtn = document.querySelector('#full-scr');
	const playerTimeTotal = document.querySelector('#player-timer .total');
	const playerTimeElapsed = document.querySelector('#player-timer .elapsed');
	const inputVideo = document.querySelector('#input-video');

	// Player

	function togglePlay() {
		if (isOwner) {
			if (video.paused) {
				video.play()
			} else {
				video.pause()
			}
			socket.emit('pause', {
				state: video.paused,
				room
			});
		}
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			player.requestFullscreen();
		}
	}

	video.addEventListener('timeupdate', function () {
		const videoProgress = video.currentTime / video.duration * 100;
		progress.style.width = videoProgress + '%';
		playerTimeTotal.textContent = toMinutes(video.duration);
		playerTimeElapsed.textContent = toMinutes(video.currentTime);
	});

	video.addEventListener('playing', function () {
		player.classList.add('playing');
	});

	video.addEventListener('pause', function () {
		player.classList.remove('playing');
	});

	video.addEventListener('loadedmetadata', function () {
		playerTimeTotal.textContent = toMinutes(video.duration);
		playerTimeElapsed.textContent = toMinutes(video.currentTime);
	});

	videoWrapper.addEventListener('click', togglePlay);
	playBtn.addEventListener('click', togglePlay);

	fullScrBtn.addEventListener('click', toggleFullscreen);

	forBtn.addEventListener('click', () => {
		if (isOwner) {
			video.currentTime += 10
			socket.emit('progress', {
				time: video.currentTime,
				room
			});
		}
	});

	revBtn.addEventListener('click', () => {
		if (isOwner) {
			video.currentTime -= 10
			socket.emit('progress', {
				time: video.currentTime,
				room
			});
		}
	});

	inputVideo.addEventListener('change', function (e) {
		// console.log(this.value);
		if (this.value && isVideo(this.value)) {
			video.setAttribute('src', URL.createObjectURL(this.files[0]));
			page.classList.add('selected');
		}
	})

	function toMinutes(total) {
		const mins = Math.floor(total / 60);
		const secs = Math.round(total - mins * 60);
		return mins + ':' + leftPad(secs);
	}

	// CONVERT number to 2 digits
	function leftPad(string) {
		const pad = '0';
		const length = 2;
		return (new Array(length + 1).join(pad) + string).slice(-length);
	}

	onInactive(5000, function () {
		player.classList.add('inactive');
	})

	function onInactive(ms, cb) {
		var wait = setTimeout(cb, ms);
		addListenerMulti(document, 'mousemove mousedown mouseup onkeydown onkeyup focus', function () {
			clearTimeout(wait);
			player.classList.remove('inactive');
			wait = setTimeout(cb, ms);
		});
	}

	function addListenerMulti(element, eventNames, listener) {
		var events = eventNames.split(' ');
		for (var i = 0, iLen = events.length; i < iLen; i++) {
			element.addEventListener(events[i], listener, false);
		}
	}

	function isVideo(filename) {
		var ext = getExtension(filename);
		switch (ext.toLowerCase()) {
			case 'm4v':
			case 'avi':
			case 'mp4':
			case 'mov':
			case 'mpg':
			case 'mpeg':
			case 'mkv':
			case 'webm':
				// etc
				return true;
		}
		return false;
	}

	function getExtension(filename) {
		var parts = filename.split('.');
		return parts[parts.length - 1];
	}

	socket.on('paused', state => {
		if (state) {
			video.pause()
		} else {
			video.play()
		}
	});

	socket.on('progress-change', time => {
		video.currentTime = time;
	})

	// window.setInterval(function () {
	// 	socket.emit('progress', {
	// 		time: video.currentTime,
	// 		room
	// 	})
	// }, 5000);

});