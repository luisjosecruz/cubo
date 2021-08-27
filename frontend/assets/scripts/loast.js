const loast = {
    init() {
        this.hideTimeout = null;

        this.element = document.createElement('div');
        this.element.className = 'loast';

        this.loast_container1 = document.createElement('div');
        this.loast_container1.className = 'loast_container';

        this.loast_container2 = document.createElement('div');
        this.loast_container2.className = 'loast_container';

        this.icon = document.createElement('i');
        this.icon.className = 'icon-envelope-open-o';
        this.loast_container1.appendChild(this.icon);

        this.title = document.createElement('p');
        this.loast_container2.appendChild(this.title);

        this.p = document.createElement('p');
        this.loast_container2.appendChild(this.p);

        this.element.appendChild(this.loast_container1);
        this.element.appendChild(this.loast_container2);

        document.body.appendChild(this.element);
    },

    show(message, state) {
        clearTimeout(this.hideTimeout);
        this.element.className = 'loast loast--visible'; 
        this.p.textContent = message;

        if(state){
            this.element.classList.add(`loast--${state}`);
            this.title.textContent = state;

            switch(state){
                case 'success': this.icon.className = 'icon-ok';
                    break;
                case 'warning': this.icon.className = 'icon-attention';
                    break;
                case 'error': this.icon.className = 'icon-attention-alt';
                    break
                default: this.icon.className = 'icon-info';
            }
        }
        
        this.hideTimeout = setTimeout(() => {
            this.element.classList.remove('loast--visible');
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => loast.init());