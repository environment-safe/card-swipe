import {
    HTMLElement,
    customElements
} from '@environment-safe/elements';
import { Scanner, CardSwipe, extractIssuerData } from '../src/index.mjs';

export class CardSwipeElement extends HTMLElement {
    constructor(options={}) {
        super();
        this.options = options;
        this.height = parseInt(this.getAttribute('height')) || 300;
        this.width = parseInt(this.getAttribute('width')) || 300;
        this.attachShadow({ mode: 'open' });
        if(this.options.showInput){
            this._button = document.createElement('button');
            this._button.setAttribute('height', this.height);
            this._button.setAttribute('width', this.width);
            this.shadowRoot.appendChild(this._button);
            this._popup = document.createElement('div');
            this._popup.setAttribute('height', '80vh');
            this._popup.setAttribute('width', '80vw');
            this.shadowRoot.appendChild(this._popup);
        }
    }
     
    connectedCallback(){
        this.render();
        this.display();
        let scanner = new Scanner();
        window.addEventListener('keydown', (e)=>{
            if(e.key.length === 1) scanner.input(e.key);
            //if(e.key === 'Enter') scanner.input("\n");
        });
        new CardSwipe({
            scanner : scanner,
            onScan : (swipeData)=>{
                const issuer = extractIssuerData(swipeData.account);
                if(issuer) swipeData.issuer = issuer;
                const event = new CustomEvent('swipe', { detail: swipeData });
                document.dispatchEvent(event);
            }
        });
    }
     
    static get observedAttributes() { return [ 'visible']; }
     
    // We reflect attribute changes into property changes
    attributeChangedCallback(attr, oldVal, newVal){
        if(oldVal !== newVal){
            this[attr] = newVal;
        }
    }
     
    render(){
        
    }
     
    display(){
     
    }
 
}
customElements.define('card-swipe', CardSwipeElement);