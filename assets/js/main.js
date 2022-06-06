/**
 * Main controller for the cataas api app
 * @author: Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

// catapi wasn't working, so I replaced it for the cataas api
const BASE_URL = 'https://cataas.com/api/cats';
const BASE_IMG_URL = 'https://cataas.com/cat';

function isElement(element) {
    return element instanceof Element;  
}

function arrayShuffle(array){
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

class CataasAPI {

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
        
    }

    #makeTemplate(){
        const data = this.data;
        for(let i = 0; i < data.length; i++){
            let obj = { id: data[i].id, template: this.#makeCard(data[i].id) }
            this.gameObjects.push(obj, obj);
        }
        arrayShuffle(this.gameObjects);
        for(let i = 0; i < this.gameObjects.length; i++){
            this.template += this.gameObjects[i].template;
        }
    }

    #applyEvents(){
        document
            .querySelectorAll('.cataas-card img')
            .forEach((el) => {
                el.addEventListener('click', (el) => {
                    console.log(el.target.id);
                });
            })
            
    }

    #makeCard(src){

        let template = `<div id="cataas-card-${src}" class='cataas-card'>
            <img id="cataas-card-img-${src}" data-id="${src}" src="${BASE_IMG_URL+'/'+src}" alt="card front" class="card-front">
            <img src="./img/back.png" alt="card back" class="card-back">
        </div>`;

        return template;

    }

    async init(){
        try{
            const data = await fetch(this.apiUrl);
            const json = await data.json();
            this.data = json;
            this.#makeTemplate();
            this.element.innerHTML = this.template;
            this.#applyEvents();
        }catch(e){
            console.log(e);
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