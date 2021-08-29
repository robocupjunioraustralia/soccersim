/**
 * @description Error handling
 */
;(function() {
    const errorHandler = {};

    errorHandler.clear = () => {
        document.getElementById('notifications').innerHTML = '';
    };

    errorHandler.escape = (str) => {
          return str
            .replace(/&/g, '&')
            .replace(/'/g, "'")
            .replace(/"/g, '"')
            .replace(/>/g, '>')
            .replace(/</g, '<')
            .replace(/\//g, '/');
    };

    /**
     * Adds an error message to the notifications box
     * @param  {[type]} message Error message.
     * @param  {[type]} type    one of 'danger', 'warning', 'success', 'info', 'link', 'primary', or empty
     */
    errorHandler.addError = (message, type) => {
        const errorBox = document.createElement('div');
        errorBox.classList.add('notification');
        if (type) {
            errorBox.classList.add( `is-${type}`);
        }
        errorBox.innerHTML = errorHandler.escape(message);
        
        const closeIcon = document.createElement('button');
        closeIcon.classList.add('delete');
        closeIcon.addEventListener('click', function() {
            errorBox.remove();
        });
        errorBox.appendChild(closeIcon);
        
        document.getElementById('notifications').appendChild(errorBox);
    };

    window.errorHandler = errorHandler;
})();
