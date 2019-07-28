//model module
var budgetController = (function(){
    
    var Expense = function(id, description, value ){
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)* 100);
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value ){
        this.id= id;
        this.description= description;
        this.value= value;
    };
    
    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data= {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return{
        addItem: function(type, des, val){
            var newItem, ID;
            
            if(data.allItems[type].length>0){
                 ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID = 0;
            }
           
            
            if(type ==='exp')
                newItem= new Expense(ID, des,val);
            else
                newItem= new Income(ID, des,val);
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget = income - expense
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            
            return allPerc;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();

//view module
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        expenseContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            var int, dec, sign;
            // add +/-
            // make num to a 2 decimal point 
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3,3);
            }
            dec = numSplit[1];
            type === 'exp'?sign = '-': sign = '+';
            
            return (type === 'exp' ? '-': '+') + ' ' + int + '.' + dec;
            
        };
    
     var nodeListForEach = function(list, callback){
                for(var i=0; i< list.length; i++){
                    callback(list[i], i);
                }
        };
    
    return {
        getInput: function(){
            
           // console.log('getting inputs');
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html,element;
            //create html string  with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
               html= '<div class="item clearfix"id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else{
                element= DOMstrings.expenseContainer;
                html= '<div class="item clearfix"id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace placeholder value with actuall data
            html= html.replace('%id%', obj.id);
            html= html.replace('%description%', obj.description);
            html= html.replace('%value%', formatNumber(obj.value, type));
            
            //insert the html to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        
        deleteListItem: function(selectorId){
           var  el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            fields= document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr= Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
           
            if(obj.percentage > 0){                                                                                   document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },
        
        displayMonth: function(){
            var now, year, month;
            now = new Date();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year= now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.addBtn).classList.toggle('red');
            
        },
        
        getDomstrings: function(){
            return DOMstrings;
        }
    };
    
})();

//controller module
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDomstrings();
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){
            if(event.keyCode===13 || event.which===13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget= function(){
        //calculate the budget 
        budgetCtrl.calculateBudget();
        //return the budget
        var budget = budgetCtrl.getBudget();
        //display budget to the ui
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentage from budget controller
        var percentages = budgetCtrl.getPercentages();
        //update the ui with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //get input field data
        input = UICtrl.getInput();
        
        if(input.description !== '' && input.value !== NaN && input.value > 0){
            //add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //add the item to the ui
            UICtrl.addListItem(newItem,input.type);
            //clear input fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();   
            
            //calculate and update percentages
            updatePercentages();
        }        
    };
    
    var ctrlDeleteItem = function(event){
        var splitId, type, id;
        var itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitId = itemID.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            //delete the item from the data structure
            budgetCtrl.deleteItem(type, id);
            //delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //updaate and show the new budget
            updateBudget();
            
            //calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function(){
            console.log('Application Starting ....');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController,UIController);

controller.init();











