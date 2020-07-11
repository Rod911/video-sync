document.addEventListener("DOMContentLoaded", function () {

	let user = '';
	const socket = io();

	socket.on('joined', data => {
		if (data) {
			window.location.href = window.location.href + 'player.html?room=' + data.id + '&user=' + user;
		} else {
			alert('Party has ended or doesn\'t exist\nRequest or create new Party ID');
		}
	});

	// Party Def

	const partyBtns = document.querySelectorAll(".party-btn");
	const formList = document.querySelector('.party-forms');

	partyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const form = document.querySelector(btn.getAttribute('data-target'));
			const activeForm = formList.querySelector('form.active');
			if (activeForm) activeForm.classList.remove('active');
			form.classList.add('active');
		});
	});

	formList.querySelectorAll('form').forEach(form => {
		form.addEventListener('submit', e => {
			e.preventDefault();
			const formData = getFormData(form);
			user = formData['user']
			const res = socket.emit(formData['action'], formData);
		});
	});

	function getFormData(form) {
		const formData = new FormData(form)
		const object = {};
		formData.forEach((value, key) => { object[key] = value });
		return object;
	}
});