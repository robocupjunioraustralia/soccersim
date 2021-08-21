'use strict';

// Modals

var rootEl = document.documentElement;
var $modals = getAll('.modal');
var $modalButtons = getAll('.modal-button');
var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button');

function getAll(selector) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    var ret = Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
    return ret;
}

// if (!localStorage.getItem('soccersim-shownchanges')) {
//     localStorage.setItem('soccersim-shownchanges', true);
//     openModal('notification-modal');
// }

if ($modalButtons.length > 0) {
    $modalButtons.forEach(function ($el) {
        $el.addEventListener('click', function () {
            var target = $el.dataset.target;
            openModal(target);
        });
    });
}

if ($modalCloses.length > 0) {
    $modalCloses.forEach(function ($el) {
        $el.addEventListener('click', function () {
            closeModals();
        });
    });
}

function openModal(target) {
    try {
        var $target = document.getElementById(target);
        console.log($target);
        rootEl.classList.add('is-clipped');
        $target.classList.add('is-active');
    } catch (e) {
        
    }
}

function closeModals() {
    rootEl.classList.remove('is-clipped');
    $modals.forEach(function ($el) {
        $el.classList.remove('is-active');
    });
}

document.addEventListener('keydown', function (event) {
    var e = event || window.event;
    if (e.keyCode === 27) {
        closeModals();
    }
});