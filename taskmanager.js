import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js'; 

// @ts-check
const operationEl = document.getElementById('header-operations');
const taskSectionEl = document.getElementById('task-section');
const winodwSetPropertiesEl = document.querySelector('.pop-up-window');

const taskCardEl = document.querySelector('.task-card');
const getInputDataEl = document.querySelectorAll('.input-data');

const getNotifyEl = document.getElementById('notification');
const getNotifyPropertiesEl = document.querySelector('.notification-properties');

const getAddCardButtonEl = document.getElementById('add-card');
const getApplyCardButtonEl = document.getElementById('apply-card');


const property = {
                    title: 0,
                    deadline: 1,
                    description: 2,
                    difficulty: 3,
                    priority: 4,
                 }




let taskCardIdArr = [];
let formState = {};
let taskCardObjs = [];
let numCardCreated = 0;



//-----------------HelperFunction--------------------------------------------------------------------------------

function reverseDateOrderSwitch(strDate, strSeparatorReplace, reverse)
{
    if(strDate !== undefined)
    {
        if(reverse)
        {
            return strDate.split('-').reverse().join(strSeparatorReplace);
        }
        else
        {
            return strDate.split(strSeparatorReplace).reverse().join('-');
        }
    }
}

function taskCardObj(id, title, deadline, description, difficulty, priority)
{
    const obj = {
                    id,
                    title,
                    deadline,
                    description,
                    difficulty,
                    priority,
        get getId()
        {
            return this.id;
        },
        get getData()
        {
            return [this.title, this.deadline, this.description, 
                    this.difficulty, this.pr];
        },
        set setProperties(arrTaskData)
        {
            //check properties are not functions, setter or getter
            const keys = Object.keys(this).filter(key => 
            typeof this[key] !== 'function' && !key.startsWith('get') && !key.startsWith('set'));

            if(!Array.isArray(arrTaskData) && keys.length !== arrTaskData.length)
            {
                console.log(`Error ${keys} could not be updated.`);
                return;
            }

            keys.slice(1).forEach((key, index) =>
            {
                    this[key] = arrTaskData[index];
            });
        }
    };
                
    return obj;

}


function combineId(strId)
{
    let id = [];

    for(let i = 0; i < 6; i++)
    {
        const randomNum = Math.floor(Math.random() * 10);
        id.push(randomNum);
    }

    const numToString = id.join('');
    const finalId = `${strId}${numToString}`

    return finalId;
}


function addWordBeforeLastIndex(arrElements, strConjunction, arrNoun)
{
    const getlastElement = arrElements.length - 1;
    const getlastIndex = arrElements.lastIndexOf(arrElements[getlastElement]);
    const filterOtherElements = arrElements.filter((element, index) => index < getlastIndex).join(', ');

    const getOtherElements = filterOtherElements.charAt(0).toUpperCase() + filterOtherElements.slice(1);
    const getSingleElement = arrElements[0].charAt(0).toUpperCase() + arrElements[0].slice(1);

    if(arrElements.length === 1)
    {
        return `${getSingleElement} ${arrNoun[0]}`;
    }
    else
    {
        return `${getOtherElements} ${strConjunction} ${arrElements[getlastElement]} ${arrNoun[1]}`;
    }
}


function isHTMLElement(eventTarget)
{
    const isHTMLElement = eventTarget instanceof HTMLElement;

    if(isHTMLElement)
    {
        return eventTarget;
    }
}


function addRemoveSwitchClass(elementA, strClassA, elementB, strClassB, boolSwitchClass)
{
    const isString = typeof strClassA === 'string' && typeof strClassB === 'string';
    const isHTMLElement = elementA instanceof HTMLElement && elementB instanceof HTMLElement;

    if(!isString)
    {
        console.log('make sure that second and fourth argument are type string.')
        return;
    }

    if(!isHTMLElement)
    {
        console.log('make sure that first and third argument is an type of html element');
    }

    if(boolSwitchClass)
    {
        elementA.classList.add(strClassA);
        elementB.classList.remove(strClassB);
    }
    else
    {
        elementA.classList.remove(strClassA);
        elementB.classList.add(strClassB);
    }
}


function resetPropertyInputs(isHtmlElement)
{
    if(isHtmlElement)
    {
        getInputDataEl.forEach(input => 
        {
            if(input instanceof HTMLInputElement || 
            input instanceof HTMLTextAreaElement)
            {
                input.value = '';
            }

            if(input instanceof HTMLButtonElement)
            {
                input.classList.remove('is-toggled');
            }
        });


        if(winodwSetPropertiesEl instanceof HTMLElement ||
        getNotifyPropertiesEl instanceof HTMLElement)
        {
            if(getNotifyPropertiesEl)
            {
                getNotifyPropertiesEl.textContent = '';
            }
            winodwSetPropertiesEl?.classList.add('hide');
        }

        formState = {};
    }
}


function updateTaskCardProperties(elementCard, arrPropertiesData, strCardId, doesEditingCard)
{
    const isElementCardHTMLElement = elementCard instanceof HTMLElement;
    if(!isElementCardHTMLElement) return;

    const getAllSpanEl = elementCard.querySelectorAll('.update-property')
    const getH2El = elementCard.querySelector('#task-section h2');
    const getDescriptionEl = elementCard.querySelector('#task-section li p')
    const getSpanOnlyData = arrPropertiesData.filter((element, index) => 
                            index !== property.title && index !== property.description);

    elementCard.setAttribute('data-id', strCardId);

    if(!doesEditingCard)
    {
        elementCard.classList.remove('hide');
    }
    


 
    const truncAmountTitle = 12;
    const isTitleTooLong = arrPropertiesData[property.title].length > truncAmountTitle;

    const isH2HTMLElement = getH2El instanceof HTMLElement;
    const isDescriptionHTMLElement = getDescriptionEl instanceof HTMLElement;
    if(!isH2HTMLElement || !isDescriptionHTMLElement) return;


    if(isTitleTooLong && getH2El instanceof HTMLElement)
    {
        const truncTitle = arrPropertiesData[property.title].slice(0, truncAmountTitle) + '...';
        getH2El.textContent = truncTitle;
    }
    else
    {
        getH2El.textContent = arrPropertiesData[property.title];
    }


    
    const truncAmountParagraph = 125;
    const isParagraphTooLong = arrPropertiesData[property.description].length > truncAmountParagraph;
    if(isParagraphTooLong && getDescriptionEl instanceof HTMLElement)
    {
        const truncParagraph = arrPropertiesData[property.description].slice(0, truncAmountParagraph) + '...';
        getDescriptionEl.textContent = truncParagraph;
    }
    else
    {
        getDescriptionEl.textContent = arrPropertiesData[property.description];
    }

    getAllSpanEl.forEach((cardProperty, index) =>
    {
        if(cardProperty instanceof HTMLElement)
        {
            cardProperty.textContent = getSpanOnlyData[index];
        }
    });
}



//=================Event-Listener========================================================================

operationEl?.addEventListener('click', function(event)
{
    const target = isHTMLElement(event.target);
    if(!target) return;


    //opens card creation
    const isAddButton = target.matches('#add-button');
    if(isAddButton)
    {
        const hideCardApplyButton = false;
        addRemoveSwitchClass(getAddCardButtonEl, 'hide', getApplyCardButtonEl, 'hide', hideCardApplyButton)

        winodwSetPropertiesEl?.classList.remove('hide')
        formState.length = 0;
    }


    //deletes the current cards selected based on the returned array in taskSectionEl?.addEventListener
    const isDelButton = target.matches('#del-button');
    if(isDelButton)
    {
        if (!taskSectionEl) return;

        const allCardTask = Array.from(taskSectionEl.querySelectorAll('.task-card'));
        allCardTask.shift(); //remove template card from array

        // Sort selected indexes in descending order
        const sortedIndexes = [...taskCardIdArr].sort((a, b) => b - a);

        sortedIndexes.forEach(index => 
        {
            const card = allCardTask[index];
            if(card) 
            {
                card.remove();
                console.log(`removed index: `, index)
            }
        });

        if(getNotifyEl)
        {
            getNotifyEl.textContent = '';
        }

        // Clear selection tracking
        taskCardIdArr.length = 0;
    }

});

//for buttons============================================================================================
winodwSetPropertiesEl?.addEventListener('click', function(event)
{
    const target = isHTMLElement(event.target);
    if(!target) return;


    //hide pop up window------------------------------------------------
    const isCloseButton = target.closest('.button-exit-popup-window');
    if(isCloseButton)
    { 
        winodwSetPropertiesEl?.classList.add('hide');
    }



    //deselect all buttons in a category------------------------------------------------
    getInputDataEl.forEach(input =>
    {
        if(input instanceof HTMLButtonElement && 
            target instanceof HTMLButtonElement)
        {
            if(input.value !== target.value && 
                input.name === target.name)
            {
                input.classList.remove('is-toggled');
            }
        }
    });



    //get input buttons data------------------------------------------------------------
    if (target instanceof HTMLButtonElement &&
        target.name && target.value) 
    {
        const isAlreadySelected = target.matches('.is-toggled');
    
        if(!isAlreadySelected)
        {
            target.classList.add('is-toggled');
            formState[target.name] = target.value;
        }
        else
        {
            target.classList.remove('is-toggled');
            delete formState[target.name];
        }
    }



    //add card and apply properties to card------------------------------------------------
    const isAddCardButton = target.matches('#add-card');
    if(isAddCardButton)
    {
        const keysOrderArr = ['title', 'deadline', 'description', 
                                'difficulty', 'priority'];
        let getData = [];
        let foundUndefined = false;
        let undefinedPropertiesArr = [];

        //generate data
        keysOrderArr.forEach(key =>
        {
            getData.push(formState[key]);
        });


        //check if all input data was defined-------------------------------------------
        getData.forEach((element, index) =>
        {
            const isUndefined = element === undefined;
            const isEmpty = element === '';

            if(isEmpty || isUndefined)
            {
                const undefinedCategory =  keysOrderArr[index];

                undefinedPropertiesArr.push(undefinedCategory);
                foundUndefined = true;
            }
        });


        //stops eventListener if empty inputs detected-----------------------------------------------------
        if(foundUndefined && getNotifyPropertiesEl instanceof HTMLElement)
        {
            const arrNoun = ['', 'are']
            const notifyInputs = addWordBeforeLastIndex(undefinedPropertiesArr, 'and', arrNoun);

            getNotifyPropertiesEl.textContent = `${notifyInputs} not set!`;
            getNotifyPropertiesEl.style.opacity = '1';
            getNotifyPropertiesEl.style.color = 'red';

            foundUndefined = false;
            return;
        }
        

        if(getNotifyPropertiesEl instanceof HTMLElement)
        {
            getNotifyPropertiesEl.style.opacity = '0';
        }


        //add card with data applied-----------------------------------------------------
        if(taskCardEl && taskSectionEl)
        {
            getData[property.deadline] = reverseDateOrderSwitch(getData[property.deadline], '.', true);

            const combinedData = numCardCreated + getData[property.deadline].split('.').join('');
            const id = combineId(combinedData);

            const duplicateEl = taskCardEl?.cloneNode(true);
            taskSectionEl?.appendChild(duplicateEl);

            console.log('card created: ', numCardCreated);
            
            if(duplicateEl instanceof HTMLElement)
            {
                updateTaskCardProperties(duplicateEl, getData, id, false);
                duplicateEl.style.display = 'block';
            }

            getData[property.deadline] = reverseDateOrderSwitch(getData[property.deadline], '.', false);
            const obj = taskCardObj(id, getData[property.title], getData[property.deadline], getData[property.description], 
                                    getData[property.difficulty], getData[property.priority]);

            taskCardObjs.push(obj);

            numCardCreated++;
        } 
    }
    resetPropertyInputs(isAddCardButton);



    //edit card and apply properties to the card which will be edit
    const isCardEdit = target.matches('#apply-card')
    if(isCardEdit)
    {
        const getObjId = formState.getId;
        let getData = Object.values(formState);
        getData.splice(0, 1);

        //updating the values of the current edit object
        taskCardObjs.forEach(taskCard =>
        {
            const doesIdMatch = taskCard.getId === getObjId;
            if(doesIdMatch)
            {
                taskCard.setProperties = getData;
            }
        });
        

        //updating html values of the current edit card
        const allCards = document.querySelectorAll('.task-card');
        getData[property.deadline] = reverseDateOrderSwitch(getData[property.deadline], '.', true);
        allCards.forEach(card =>
        {
            const isCardHTMLElement = card instanceof HTMLElement;
            if(!isCardHTMLElement) return;

            const getCardElementId = card.dataset.id;
            const doesIdMatch = getCardElementId === getObjId;
            if(doesIdMatch)
            {
                updateTaskCardProperties(card, getData, getObjId, true)
            }
        });

        winodwSetPropertiesEl.classList.add('hide');
    }
    resetPropertyInputs(isCardEdit);


    //close window and resets text values------------------------------------------------
    const isCancelButton = target.matches('.cancel-action')
    resetPropertyInputs(isCancelButton);
 
});

//for input==============================================================================================
winodwSetPropertiesEl?.addEventListener('input', function(event)
{
    const target = isHTMLElement(event.target);
    if(!target) return;


    if(target instanceof HTMLInputElement ||
       target instanceof HTMLTextAreaElement)
    {

        //get data of textarea and input
        formState[target.name] = target.value;
    }
})

//tracks cards===========================================================================================
taskSectionEl?.addEventListener('click', function(event)
{
    const target = isHTMLElement(event.target);
    if(!target) return;


    //editing card values of properties
    const isTaskCard = target.closest('.task-card');
    const editButtonTarget = target.closest('.task-edit-button')
    if(editButtonTarget && isTaskCard instanceof HTMLElement)
    {

        const hideCardAddButton = true;
        addRemoveSwitchClass(getAddCardButtonEl, 'hide', getApplyCardButtonEl, 'hide', hideCardAddButton);
        
        taskCardObjs.forEach(task =>
        {

            const getSelectedId = isTaskCard.dataset.id;
            
            if(getSelectedId === task.getId)
            {
                formState = task;
            }

        });

        //Apply the values of the objTask to the input and buttons
        getInputDataEl.forEach(input =>
        {
            const isHTMLTextAreaOrInput = input instanceof HTMLTextAreaElement ||
                                          input instanceof HTMLInputElement
            const isHTMLButton = input instanceof HTMLButtonElement
         

            if(isHTMLTextAreaOrInput)
            {
                const taskProperties = Object.keys(formState);
                taskProperties.forEach(taskProperty => 
                {
                    const doesPropertiesMatch = input.name === taskProperty;
                    if(doesPropertiesMatch)
                    {

                        input.value = formState[taskProperty];
                    }
                });
            }
             else if(isHTMLButton)
             {
                 const taskValues = Object.values(formState);
                 taskValues.forEach(taskValue => 
                 {
                     const isDifficultyOrPriority = input.name === 'difficulty' || 
                                                    input.name === 'priority'
                     const doesValuesMatch = input.value === taskValue;
                     if(doesValuesMatch && isDifficultyOrPriority)
                     {
                        input.classList.add('is-toggled');
                     }
                 });
             }
        });

        winodwSetPropertiesEl?.classList.remove('hide')

        return;
    }

    //applies selection
    const clickedCard = target.closest('.task-card');
    if(clickedCard && taskSectionEl.contains(clickedCard) && getNotifyEl)
    {
        const cardTaskAll = taskSectionEl.querySelectorAll('.task-card');
        const cardsArr = Array.from(cardTaskAll);
        cardsArr.shift(); //remove template card from array

        const getIndexOfEl = cardsArr.indexOf(clickedCard);
        const arrToString = taskCardIdArr.join(' ');
        const hasIndex = arrToString.includes(`${getIndexOfEl}`);

        const removeIndex = taskCardIdArr.indexOf(`${getIndexOfEl}`);


        if(!hasIndex) 
        {
            clickedCard.classList.add('is-selected');
            taskCardIdArr.push(getIndexOfEl);
            // console.log('index got added');
        }
        else
        {
            clickedCard.classList.remove('is-selected');
            taskCardIdArr.splice(removeIndex, 1);
            // console.log('index got removed');
        }
        
        const arrLength = taskCardIdArr.length
        const isArrEmpty = arrLength === 0;
        const hasOneArrEl = arrLength === 1;

        const notificationMultipleText = `currenty are ${arrLength} cards selected.`;
        const notificationSingleText =  `currenty is 1 card selected.`;

        //track how many cards are selected and display it on browser
        if(!isArrEmpty && !hasOneArrEl)
        {
            getNotifyEl.textContent = notificationMultipleText;

        }
        else if(hasOneArrEl)
        {
            getNotifyEl.textContent = notificationSingleText;
        }
        else
        {
            getNotifyEl.textContent = '';
        }
    }


});



//=================Card========================================================================

//makes card sortable per dragmove and drop============================================================== 
new Sortable(document.getElementById('task-section'), 
{
  animation: 150,
  ghostClass: 'dragging'
});
