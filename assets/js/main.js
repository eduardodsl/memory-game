/**
 * Main controller for the cataas api app
 * @author: Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

// catapi wasn't working, so I replaced it for the cataas api
const BASE_URL = 'https://cataas.com/api/cats';
const BASE_IMG_URL = 'https://cataas.com/cat';
const BASE_IMG_URL_FALLBACK = './assets/img';
const FALLBACK_DATA = [{"id":"595f280c557291a9750ebf80","created_at":"2015-11-06T18:36:37.342Z","tags":["cute","eyes"]},{"id":"595f280e557291a9750ebf9f","created_at":"2016-10-09T12:51:24.421Z","tags":["cute","sleeping"]},{"id":"595f280e557291a9750ebfa6","created_at":"2016-11-22T15:20:31.913Z","tags":["cute","sleeping"]},{"id":"595f280f557291a9750ebfb6","created_at":"2016-11-21T22:23:06.720Z","tags":["cute","funny","gif"]},{"id":"595f280f557291a9750ebfb7","created_at":"2016-11-30T09:32:46.293Z","tags":["computer","cute","orange"]},{"id":"595f280f557291a9750ebfbb","created_at":"2016-11-22T06:47:08.956Z","tags":["cute","ange","angel"]}];

/**
 * Checks if is a valid dom element
 * @param {Element} element - the element to check
 * @returns {boolean}
 */
function isElement(element) {
    return element instanceof Element;  
}

/**
 * Shuffles array content by reference
 * @param {array} array 
 */
function arrayShuffle(array){
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * CataasAPI game card object
 */
class Card {

    /**
     * @param {string} id - cat id
     * @param {string} baseImage - base address where the images are located
     */
    constructor(id, baseImage = BASE_IMG_URL){
        this.id = id;
        this.index = -1;
        this.checked = false;
        this.baseImage = baseImage;
    }

    /**
     * Builds the card template
     * @returns {string}
     */
    template(){
        const id = this.id;
        const index = this.index;
        let template = `<div id="cataas-card-${id}-${index}" data-cataas="${id}" data-index="${index}" class='cataas-card'>
            <img id="cataas-card-img-${id}" data-id="${id}" src="${this.baseImage+'/'+id}" alt="card front" class="card-front">
            <img src="./assets/img/back.jpg" alt="card back" class="card-back">
        </div>`;

        return template;

    }

}

/**
 * Main CataasAPI game class
 */
class CataasAPI {
    /**
     * @param {Element} element - main element that will receive the game tamplate 
     * @param {array} tags - tags to be use when selecting the cat images
     * @param {number} limit - how many cats should be loaded, 6 cats would make 12 cards
     */
    constructor(element, tags = ['cute'], limit = 6){

        if(!isElement(element)){
            throw TypeError('cataas-api: element is not a valid DOM element!');
        }

        if(!Array.isArray(tags)){
            throw TypeError('cataas-api: tags is not an array!');
        }

        if(Number.isNaN(limit)){
            throw TypeError('cataas-api: limit is not a number!');
        }

        this.element = element;
        this.apiUrl = `${BASE_URL}?tags=${tags}&limit=${limit}`;
        this.template = '';
        this.data = [];
        this.gameObjects = [];

        this.fallbackMode = false;

        this.selectedCard = null;
        this.checkedCards = 0;
        this.isBlocked = false;
        
    }

    /**
     * Builds the main app template
     */
    #makeTemplate(){
        const data = this.data;
        const baseImage = this.fallbackMode ? BASE_IMG_URL_FALLBACK : BASE_IMG_URL;
        for(let i = 0; i < data.length; i++){
            const card = new Card(data[i].id, baseImage);
            this.gameObjects.push(card, card);
        }
        arrayShuffle(this.gameObjects);
        for(let i = 0; i < this.gameObjects.length; i++){
            this.gameObjects[i].index = i;
            this.template += this.gameObjects[i].template();
        }
    }

    /**
     * Verifies if the card is already checked with its pair
     * @param {Element} card 
     * @returns 
     */
    #isCardChecked(card){
        for(let i = 0; i < this.gameObjects.length; i++){
            let obj = this.gameObjects[i];
            if(card.dataset.cataas === obj.id){
                return obj.checked;
            }
        }
    }

    /**
     * Marks the card as checked
     * @param {Element} card 
     */
    #checkCard(card){
        for(let i = 0; i < this.gameObjects.length; i++){
            let obj = this.gameObjects[i];
            const cardId = card.dataset.cataas;
            if(cardId === obj.id){
                obj.checked = true;
            }
        }
    }

    /**
     * Compares if the first selected card is compatible with its pair
     * @param {Element} selected 
     * @param {Element} compared 
     * @returns {boolean}
     */
    #isSameCard(selected, compared){
        let isSame = ((selected.dataset.index !== compared.dataset.index) &&
        (selected.dataset.cataas === compared.dataset.cataas));
        return isSame;
    }
    
    /**
     * Once the tamplate is loaded, all the DOM elements will recieve event listeners
     */
    #applyEvents(){
        document
            .querySelectorAll('.cataas-card')
            .forEach((card) => {
                card.addEventListener('click', () => {
                    if(this.isBlocked){
                        return;
                    }
                    this.isBlocked = true;
                    if(this.selectedCard === null){
                        this.selectedCard = card;
                    }else{
                        
                        if(this.#isCardChecked(this.selectedCard)){
                            this.selectedCard = null;
                            this.isBlocked = false;
                            return;
                        }

                        if(this.selectedCard.id === card.id){
                            this.selectedCard = null;
                            this.isBlocked = false;
                            return;
                        }

                        if(this.#isSameCard(this.selectedCard, card)){
                            this.checkedCards++;
                            this.#checkCard(card);
                            if(this.checkedCards === (this.gameObjects.length / 2)){
                                setTimeout(() => {
                                    alert("fim de jogo");
                                }, 1000);
                            }else{
                                this.selectedCard = null;
                                this.isBlocked = false;
                            }
                        }else{
                            setTimeout(() => {
                                this.selectedCard.classList.remove('flip');
                                card.classList.remove('flip');
                                this.selectedCard = null;
                                this.isBlocked = false;
                            }, 1000);
                        }

                    }
                    card.classList.add('flip');
                    setTimeout(() => {
                        this.isBlocked = false;
                    }, 1000);
                    
                });
            })
            
    }

    /**
     * Initializes the application
     */
    async init(){
        try{
            // try to load data from the api
            const data = await fetch(this.apiUrl);
            const json = await data.json();
            this.data = json;
        }catch(e){
            // if it fails to load the api, local data will be loaded
            console.log(e);
            console.info('failed to load from cataas-api, loading in fallback mode');
            this.fallbackMode = true;
            this.data = FALLBACK_DATA;
        }finally{
            this.#makeTemplate();
            this.element.innerHTML = this.template;
            this.#applyEvents();
        }
    }


}

class Main {

    /**
     * Method containing all the intilization logic of the application
     * @returns void
     */
    async init(){
        const cataas = new CataasAPI(document.getElementById('game'));
        console.log(await cataas.init());
    }

}

// instantiates the main app
const app = new Main();

// only when all DOM is loaded the app should run
document.addEventListener( 'DOMContentLoaded', () => app.init() );