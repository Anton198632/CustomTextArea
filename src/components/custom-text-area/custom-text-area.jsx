import './custom-text-area.css'

import { Component } from 'react';

class CustomTextArea extends Component {

    toggleVisibilityCursor;
    
    cursorTextAreaPosition = 0;
    cursorTextAreaPositionPre = 0;
    currentRowPosition = 0;
    currentPositionInLine = 0;
    rowsLength = []
    ctrlPress = false;
    shiftPress = false;
    altPress = false;
    textAreaHidden = null;
    cursor = null;
    maxSymbolsInRow = 0;
    regexPatterns = []
    
    perState = null;
    preCursorPosition = null;

    isMousePressed = false;

    selectedFrom = 0;
    selectedTo = 0;

    isClear = false;

    constructor(props) {
        super(props);

        this.regexPatterns = props.regexPatterns;

        this.state = {text: '', selectedRegion: {from: -1, to: -1}}

    }

    getText = () => {
        return this.state.text;
    }


    
    componentDidMount() {

        this.cursor = document.querySelector(`#cursor${this.props.id}`);
        this.textAreaHidden = document.querySelector(`#textAreaHidden${this.props.id}`);


        if (this.maxSymbolsInRow==0){
           this.updateTextView();
        }

        let prevWidth = 0;
        new ResizeObserver(resizeRecords => {
            resizeRecords.forEach(record => {
                const width = record.borderBoxSize?.[0].inlineSize;
                if (typeof width === 'number' && width != prevWidth){
                    this.updateTextView();
                }
            })
            
        }).observe(document.querySelector(`#textArea${this.props.id}`).parentElement, {attributeOldValue: true})



    }

    setTextDefault = (text) => {
        this.setStateShell({text: 
            this.props.preProcessText? this.props.preProcessText(text): text, 
            selectedRegion: {from: -1, to: -1}});    
    }

    clearText(){
        
        this.isClear = true;
        return this.setStateShell({text: '', selectedRegion: {from: -1, to: -1}});
    }


    updateTextView = () => {
        this.maxSymbolsInRow = Math.floor(document.querySelector(`#textArea${this.props.id}`).clientWidth/this.getSymbolSize().width);
        this.setStateShell((state) => ({state}))
    }

    setStateShell = (state, callbackFunction) => {
        this.perState = this.state;
        this.setState(state, callbackFunction);

    }


    onClickHandler = (e) => {

        if (this.toggleVisibilityCursor){
            clearInterval(this.toggleVisibilityCursor);
        }


        const offset = this.getOffset(`#textArea${this.props.id}`);
      
        if (this.state.text.length === 0){
            this.cursorPositionXYCalculate(offset.left, offset.top );
        } else {
            this.cursorPositionXYCalculate(e.pageX, e.pageY);
        }

        

        this.cursor.style.visibility = "visible";

        
        if (this.currentRowPosition>=this.rowsLength.length)
            this.currentRowPosition = this.rowsLength.length-1;

        if (this.getCurrentPositionInLine()>= this.rowsLength[this.currentRowPosition].length - 1){
            const xPosition = (this.rowsLength[this.currentRowPosition].length - 1)*this.getSymbolSize().width+offset.paddingLeft;
            const yPosition = this.currentRowPosition*this.getSymbolSize().height + offset.paddingTop;
            this.cursor.style.left = `${xPosition}px`;
            this.cursor.style.top = `${yPosition}px`;

            this.cursorPositionXYCalculate(this.getOffset(`#cursor${this.props.id}`).left, this.getOffset(`#cursor${this.props.id}`).top);
        } else {
            this.cursor.style.left = `${this.getCurrentPositionInLine()*this.getSymbolSize().width+offset.paddingLeft}px`;
        }
        
        this.cursor.style.top =`${this.currentRowPosition*this.getSymbolSize().height + offset.paddingTop}px`;
 
        this.cursor.style.width = `${this.getSymbolSize().width}px`;
        this.cursor.style.height = `${this.getSymbolSize().height}px`;
        

        this.textAreaHidden.style.top = this.cursor.style.top;
        this.textAreaHidden.focus();

        this.toggleVisibilityCursor = setInterval(()=> {
            if (this.cursor.style.visibility && this.cursor.style.visibility === 'hidden'){
                this.cursor.style.visibility = "visible";
            }
            else 
            this.cursor.style.visibility = "hidden"; 
    
        }, 500);

    }



    onKeyDownHandler = (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                this.cursorPositionChangeByLeftRightArrows(-1);
                return;
            case 'ArrowRight':
                this.cursorPositionChangeByLeftRightArrows(1);
                return;
            case 'ArrowUp':
                this.cursorPositionChangeByUpDownArrows(-1);
                return;
            case 'ArrowDown':
                this.cursorPositionChangeByUpDownArrows(1);
                return;
            case 'Enter':
                this.addSymbolToText('\n');
                return;
            case ' ':
                this.addSymbolToText(' ');
                return;
            case 'Backspace':
                this.deleteSymbol(e.key);
                return;
            case 'Delete':
                this.deleteSymbol(e.key);
                return;

            case 'Control':
                this.ctrlPress = true;
                return;
            case 'Shift':
                this.shiftPress = true;
                return;
            case 'Alt':
                this.altPress = true;
                return;

            case 'v':
            case 'м':
                if (this.ctrlPress){

                    navigator.clipboard.readText().then(data => {
                        this.addSymbolToText(data);
                    });
                    
                    return;
                }
                break;

            case 'c':
            case 'с':
                if (this.ctrlPress){

                    const {from, to} = this.state.selectedRegion;
                    navigator.clipboard.writeText(this.state.text.slice(from, to));
                    this.setStateShell({selectedRegion: {from: -1, to: -1}});
            
                    return;
                }
                break;
            
            case 'x':
            case 'ч':
                if (this.ctrlPress){

                    const {from, to} = this.state.selectedRegion;
                    navigator.clipboard.writeText(this.state.text.slice(from, to));
                    this.deleteSymbol(e.key);
            
                    return;
                }
                break;

            case 'z':
            case 'я':
                if (this.ctrlPress){
                    this.setStateShell(this.perState)
            
                    return;
                }
                
                break;

            case 'a':
            case 'ф':
                if (this.ctrlPress){
                    this.setStateShell({selectedRegion: {from: 0, to: this.state.text.length}})
                    return;
                }
                break;

            default:
                break;
        }

        if (e.key.length === 1 && e.key.match(/[а-яА-Я_0-9a-zA-Z,./:;'"\[\]\\=+\|{}?@#$%^&*()!~\-`№%*<>]/) && !this.altPress){
            this.addSymbolToText(e.key);
        }

        

    }

    deleteSymbol = (key, callbackFunction) => {

        const {from, to} = this.state.selectedRegion;

        if (from !== to){
            const text = `${this.state.text.slice(0, from)}${this.state.text.slice(to)}`
            this.setStateShell({
                text: this.props.preProcessText? this.props.preProcessText(text): text, 
                selectedRegion: {from: -1, to: -1}
            }, () => {
                if (callbackFunction)
                    callbackFunction();
            });
            
            if (to===this.cursorTextAreaPosition) {
                for (let i = Math.abs(to-from); i>0; i--){
                    this.cursorPositionChangeByLeftRightArrows(-1);
                }
            }

            return
        }

        let newText = 
            key === 'Backspace' ?  [this.state.text.slice(0, this.cursorTextAreaPosition-1), this.state.text.slice(this.cursorTextAreaPosition)].join('')
            : [this.state.text.slice(0, this.cursorTextAreaPosition), this.state.text.slice(this.cursorTextAreaPosition+1)].join('');
    
        if (key === 'Backspace'){
            this.cursorPositionChangeByLeftRightArrows(-1);
        }
        this.setStateShell({
            text: this.props.preProcessText? this.props.preProcessText(newText): newText, 
            selectedRegion: {from: -1, to: -1}
        }, () => {
               
        });
    }

    addSymbolToText = (symbol) => {

        const {from, to} = this.state.selectedRegion;
        
        if (from !== to)
            this.deleteSymbol('Backspace', ()=> {this._addSymbolToText(symbol)});
        else 
            this._addSymbolToText(symbol);
        
        
    }

    _addSymbolToText = (symbol) => {
        let newText = [this.state.text].join('');
        if (this.cursorTextAreaPosition === 0)
            newText = [symbol, newText].join('');
        else if (this.cursorTextAreaPosition > 0 && this.cursorTextAreaPosition < this.state.text.length)
            newText = [this.state.text.slice(0, this.cursorTextAreaPosition), symbol, this.state.text.slice(this.cursorTextAreaPosition)].join('');
        else if (this.cursorTextAreaPosition === this.state.text.length)
            newText = [newText, symbol].join('');
        const newTextPostProcess = this.props.preProcessText? this.props.preProcessText(newText): newText
        this.setStateShell({
            text: newTextPostProcess, 
            selectedRegion: {from: -1, to: -1}
        }, () => {

            this.cursorPositionChangeByLeftRightArrows(
                symbol.length + (newTextPostProcess.length - newText.length), false);
        });

    }

    cursorPositionChangeByUpDownArrows = (i) => {
        this.currentRowPosition = this.currentRowPosition + i;
        if (this.currentRowPosition < 0){
            this.currentRowPosition=0;
            return;
        }
        const countRows = this.rowsLength.length; 
        if (i>0 && this.currentRowPosition > countRows - 1){
            this.currentRowPosition--;
            return;
        }

        const offset = this.getOffset(`#textArea${this.props.id}`);
        const symbolHeight = this.getSymbolSize().height;
        const symbolWidth = this.getSymbolSize().width;
        let cursorPositionY = this.currentRowPosition*symbolHeight + offset.paddingTop;

        this.cursor.style.top = `${cursorPositionY}px`

        const symbolsInLine = this.getLengthLineSymbols(this.currentRowPosition) - 1
        if (symbolsInLine<parseInt(this.cursor.style.left)/symbolWidth){
            console.log(symbolsInLine);
            this.cursor.style.left = `${symbolsInLine*symbolWidth + offset.paddingLeft}px`
        }

        
        this.getSymbolPositionInText(this.currentRowPosition, Math.round((parseInt(this.cursor.style.left) - offset.paddingLeft)/symbolWidth))
        
        this.textAreaHidden.style.top = this.cursor.style.top

        this.selectTextByShift();
        
    }

    cursorPositionChangeByLeftRightArrows = (i, selectByShiftPressed = true) => {

        
        this.cursorTextAreaPosition += i;
        
        if (this.cursorTextAreaPosition > this.state.text.length) {
            this.cursorTextAreaPosition--;
            return;
        }
        if (this.cursorTextAreaPosition < 0) {
            this.cursorTextAreaPosition++;
            return;
        }

        const offset = this.getOffset(`#textArea${this.props.id}`);
        
        let nextPosition = parseFloat(this.cursor.style.left) + i * this.getSymbolSize().width;
  

        if (i>0 && this.currentPositionInLine >= this.getLengthLineSymbols(this.currentRowPosition)-1){
            
            const nextRowShiftToX = this.currentPositionInLine - this.getLengthLineSymbols(this.currentRowPosition)+1;
            this.currentRowPosition++;
            this.cursor.style.left = `${nextRowShiftToX*this.getSymbolSize().width}px`;
            this.currentPositionInLine = nextRowShiftToX;
            
        } else if (i<0 && this.currentPositionInLine < 1) {
            this.currentRowPosition--;
            const symbolsInLine = this.getLengthLineSymbols(this.currentRowPosition) - 1;
            nextPosition = symbolsInLine * this.getSymbolSize().width;
            this.cursor.style.left = `${nextPosition}px`;
            this.currentPositionInLine = symbolsInLine;
        } else {
            this.cursor.style.left = `${nextPosition}px`;
            this.currentPositionInLine = Math.round((parseFloat(this.cursor.style.left) - offset.paddingLeft)/this.getSymbolSize().width);
            this.cursor.style.left = `${this.currentPositionInLine*this.getSymbolSize().width}px`;
        }

        this.cursor.style.left = `${this.getCurrentPositionInLine()*this.getSymbolSize().width+offset.paddingLeft}px`;
        this.cursor.style.top =  `${this.getSymbolSize().height * this.currentRowPosition + offset.paddingTop}px`;

        this.textAreaHidden.style.top = this.cursor.style.top

        if (selectByShiftPressed)
                this.selectTextByShift();
    }


    selectTextByShift = () => {
        if (this.shiftPress){
            
            if (this.cursorTextAreaPosition>=this.state.selectedRegion.from)
                this.setStateShell({selectedRegion: {from: this.state.selectedRegion.from, to: this.cursorTextAreaPosition}})
            else 
                this.setStateShell({selectedRegion: {from: this.cursorTextAreaPosition, to: this.state.selectedRegion.to}})

        } else {
            this.setStateShell({selectedRegion: {from: this.cursorTextAreaPosition, to: this.cursorTextAreaPosition}})
        }
    }


    
    onBlurHandler = () => {
        if (this.toggleVisibilityCursor){
            clearInterval(this.toggleVisibilityCursor);
        }
        this.cursor.style.visibility = "hidden"; 
    }


    getOffset = (selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        const parrent = document.querySelector(selector).parentElement;

        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          paddingTop: parseInt(parrent.style.paddingTop)?parseInt(parrent.style.paddingTop):0,
          paddingLeft: parseInt(parrent.style.paddingLeft)?parseInt(parrent.style.paddingLeft):0
        };
    }


    cursorPositionXYCalculate = (clickPointX, clickPointY) => {

        const symbolWidth = this.getSymbolSize().width;
        const symbolHeight = this.getSymbolSize().height;
        const offset = this.getOffset(`#textArea${this.props.id}`);
        let y = Math.floor((clickPointY-offset.top)/symbolHeight)*symbolHeight// - offset.top - 6;
        y = y < 0 ? 0 : y;
        const rowNumber = y/symbolHeight;
        this.currentRowPosition = rowNumber;
        const symbolPositionInText = this.getSymbolPositionInText(
            rowNumber, Math.round((clickPointX-offset.left)/symbolWidth))

            return {
            x: Math.round((clickPointX - offset.left)/symbolWidth)*symbolWidth, 
            y: y,
            currentSymbol: symbolPositionInText};
    }

    getLengthLineSymbols = (rowNumber) => {
        if (rowNumber>this.rowsLength.length-1)
            return this.rowsLength[0].length;
        return this.rowsLength[rowNumber].length;
    }

    getShiftInLine = (rowNumber) => {
        return this.rowsLength[rowNumber].shift;
    }

    getSymbolPositionInText = (numberRow, symbolInLine) => {
        let pos = 0;
        for (let i=0; i<this.rowsLength.length; i++){
            if (i === numberRow){
                pos += symbolInLine// - this.rowsLength[i].shift;
                break;
            } else {
                pos += this.rowsLength[i].length;
            }

        }

        this.currentPositionInLine = symbolInLine;
        this.cursorTextAreaPosition = pos;
        return pos;

    }

    getCurrentPositionInLine = () => {
        let pos = this.cursorTextAreaPosition;
        for (let i=0; i<this.rowsLength.length; i++){
            if (i !== this.currentRowPosition){
                pos -= this.rowsLength[i].length;
            } else {
                break;
            }
        }
        return pos;
    }


    getSymbolSize() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const textInLine = document.querySelectorAll(".text-in-line");
        let font = getComputedStyle(textInLine[0]).font;
        context.font = font;
        const textMetric = context.measureText("a");

        console.log();
        return {width: textMetric.width, height: document.querySelector('pre').getBoundingClientRect().height};
    }

    getRowLength = (row) => {
        if (row<0)
            return
        return this.state.text.split('\n')[row].length;
    }


    onKeyUpHandler = (e) => {

        switch (e.key){
            case 'Control':
                this.ctrlPress = false;
                break;
            case 'Shift':
                this.shiftPress = false;
                break;
            case 'Alt':
                this.altPress = false;
                break;
            
            default:
                break;
        }


    }


    splitRow = (row, maxLength) => {
        let slices = [];

        let firstSlice = row.slice(0, maxLength)
        let secondSlice = row.slice(maxLength)

        if (secondSlice !== ""){
            const lastSpaceIndex = firstSlice.lastIndexOf(" ");
            if (lastSpaceIndex>0){
                firstSlice = row.slice(0, lastSpaceIndex+1);
                secondSlice = row.slice(lastSpaceIndex+1);
            }
        }
              
        slices = slices.concat(firstSlice)

        if (secondSlice.length > maxLength){
            slices = slices.concat(this.splitRow(secondSlice, maxLength));
        } else {
            slices = slices.concat(secondSlice)
        }

        return slices;
    }


    onMouseDownHandler = (e) => {

        this.cursorTextAreaPositionPre = this.cursorTextAreaPosition;
        

        e.preventDefault();
        this.isMousePressed = true;

        this.selectedFrom = this.cursorPositionXYCalculate(e.pageX, e.pageY).currentSymbol;
        this.setStateShell({selectedRegion: {from: -1, to: -1}});

    }

    onMouseUpHandler = (e) => {
        this.isMousePressed = false;

        const {from, to} = this.state.selectedRegion;
        if (this.shiftPress) {
            this.setStateShell({selectedRegion: {from: this.cursorTextAreaPositionPre, to: this.cursorTextAreaPosition}})
            
        } else if (from < 0 && to < 0) {
            const cursorPosition = this.cursorPositionXYCalculate(e.pageX, e.pageY).currentSymbol;
            this.setStateShell({selectedRegion: {from: cursorPosition, to: cursorPosition}});
        }


    }

    onMouseMoveHandler = (e) => {
        if (this.isMousePressed){
            this.selectedTo = this.cursorPositionXYCalculate(e.pageX, e.pageY).currentSymbol;
            this.setStateShell({selectedRegion: {from: this.selectedFrom, to: this.selectedTo}});
        }
    }


    createSpaceDiv = (className = '') => {
        return (<div className={className} >&nbsp;</div>)
    }


    scrollToTop = () => {
        document.querySelector('.mirror-text-view').scrollTop = 0;
    }



    render () {

        const {text} = this.state;
        this.rowsLength = [];
        let shift = 0;

        let wordSymbolInText = 0;

        let {from, to} = this.state.selectedRegion;
        if (to<from)
            this.setStateShell({selectedRegion: {from: to, to: from}})


        const {style} = this.props.style?this.props:{};
        console.log(style);

        return (

            <div className='mirror-text-view section' 
            style={{paddingLeft: '20px', paddingRight: '20px', paddingTop: '5px', ...style}}
            onClick={this.onClickHandler}
            
            >
                <textarea 
                    id={`textAreaHidden${this.props.id}`} 
                    onKeyUp={this.onKeyUpHandler} 
                    onKeyDown={this.onKeyDownHandler} 
                    onBlur={this.onBlurHandler} 
                    value={text} onChange={()=>{}} 
                    style={{opacity: '0%', zIndex: -1, top: '0px', position: 'absolute'}}
                    />
                <div id={`textArea${this.props.id}`} style={{zIndex: 10, border: "0px solid black"}} 
                    onMouseDown={this.onMouseDownHandler} 
                    onMouseMove={this.onMouseMoveHandler}
                    onMouseUp={this.onMouseUpHandler}
                    >
                        {
                             text.split('\n').map((item, i) => {
                                let dataRow = item + '\n';

                                return this.splitRow(dataRow, this.maxSymbolsInRow===0?100:this.maxSymbolsInRow).map((data,j) => {
                                    if (data === "")
                                        return null;

                                    shift = j===0?shift:shift+1;
                                    this.rowsLength.push({length: data.length, shift: shift })

                                    const words = data.split(/ /);

                                    let preWord = '';

                                    return (<pre key={i.toString()+j} className=" mirror-line " role="presentation"  >
                                                <div role="presentation" className='text-in-line'   >
                                                    {words.map((word, r) =>{

                                                        const nextWordSymbolInText = wordSymbolInText + (r !==words.length-1?word.length+1:word.length);
                                                        if (to>from && nextWordSymbolInText >from && wordSymbolInText<=to){

                                                            let wordSelectedStartPosition = 0
                                                            
                                                            if (nextWordSymbolInText - from < word.length+1)
                                                                wordSelectedStartPosition = from - wordSymbolInText;

                                                            let wordSelectedEndPosition = wordSymbolInText+word.length;
                                                            if (wordSelectedEndPosition>to){
                                                                wordSelectedEndPosition = to - wordSelectedEndPosition;
                                                            }

                                                            wordSymbolInText = nextWordSymbolInText; 

                                                            let selectedWordNonSlincePre = word.slice(0, wordSelectedStartPosition)
                                                            let selectedWordSlince = word.slice(wordSelectedStartPosition, wordSelectedEndPosition);
                                                            let selectedWordNonSlince = word.slice(wordSelectedEndPosition)

                                                            return (
                                                            <div style={{display: 'flex'}} key={i.toString()+j.toString()+r}>
                                                                <div>{selectedWordNonSlincePre}</div>
                                                                <div className='selectedText'>{selectedWordSlince}</div>
                                                                {r !==words.length-1 && selectedWordNonSlince === ''?this.createSpaceDiv(
                                                                    wordSymbolInText-1!==to? 'selectedText' : ''):''}
                                                                <div>{selectedWordNonSlince}</div>
                                                                {r !==words.length-1 && selectedWordNonSlince !== ''?this.createSpaceDiv(''):''}
                                                            </div>);
                                                        }

                                                        wordSymbolInText = nextWordSymbolInText; 

                                                        let wordResult = word;
                                                        let wordForCheckByPatterns = word.slice(word.length-1) === ','?word.slice(0,word.length-1):word
                                                        wordForCheckByPatterns = wordForCheckByPatterns.replace(',', '.').replace('(', '').replace(')', '')

                                                        for (let p=0; p < this.regexPatterns.patterns.length; p++) {
                                                            if (this.regexPatterns.patterns[p].pattern.test(wordForCheckByPatterns)){

                                                                const color = this.regexPatterns.patterns[p].color;
                                                                 
                                                                wordResult = (
                                                                <div style={{display: 'flex'}} key={i.toString()+j.toString()+r}>
                                                                    <div className={color}>
                                                                        {word}
                                                                    </div>

                                                                    {r !==words.length-1?this.createSpaceDiv(''):''}
                                                                </div>);
                                                                preWord = word
                                                                return wordResult;
                                                            }
                                                                
                                                        }

                                                        preWord = word;
                                                        return r!==words.length-1? 
                                                            (<div style={{display: 'flex'}} key={i.toString()+j.toString()+r}><div>{wordResult + ' '}</div></div>)
                                                            : (<div style={{display: 'flex'}} key={i.toString()+j.toString()+r}><div>{wordResult}</div></div>);

                                                    })}
                                                </div>
                                            </pre>
                                    );
                                });
                            })
                        }
                </div>

                <div className="cursor" id={`cursor${this.props.id}`} >
                    <div>&nbsp;</div>
                </div>
                    
                    
            </div>

        )
    }

}

export default CustomTextArea;