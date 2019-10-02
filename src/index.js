function eval() {
    // Do not use eval!!!
    return;
}

function expressionCalculator(expr) {
    expr = expr.replace(/\s/g, ''); //delete spaces
    if ((expr.match(/\(/g) || []).length !== (expr.match(/\)/g) || []).length) { //check that brackets quantity is equal
        throw new TypeError("ExpressionError: Brackets must be paired");
    }

    // tokenization - create tokens string like "Literal:2;Operator:+;Literal:2;"
    expr = expr.replace(/([\d]{1,3})/g, 'Literal:$1;')
        .replace(/(\+)/g, 'Operator:$1;')
        .replace(/(\*)/g, 'Operator:$1;')
        .replace(/(\-)/g, 'Operator:$1;')
        .replace(/(\/)/g, 'Operator:$1;')
        .replace(/(\()/g, 'LeftParenthesis:$1;')
        .replace(/(\))/g, 'RightParenthesis:$1;');

    //create array with tokens objects like  { type: 'Operator', value: '+' }
    let tokens = expr.split(';').map(function(el) {
        if (el) {
            let parts = el.split(':');
            return {
                'type': parts[0],
                'value': parts[0] === 'Literal' ? parseInt(parts[1]) : parts[1]
            }
        }
    });

    //delete the empty element - the last after split(';')
    tokens.pop();

    let operator = {
        "+": function (a, b) { return a + b; },
        "-": function (a, b) { return a - b; },
        "*": function (a, b) { return a * b; },
        "/": function (a, b) {
            if (b === 0) {
                throw new TypeError("TypeError: Division by zero.");
            }
            return a / b; }
    };

    //start to make Reverse polish notation
    let queue = [];
    let operatorStack = [];

    let precedence = {"*": 2, "/": 2, "+": 1, "-": 1};

    tokens.forEach(function (token) {
        switch (token.type) {
            case "Literal":
                queue.push(token);
                break;
            case "Operator":
                if (operatorStack.length > 0) {
                    let lastOperator = operatorStack[operatorStack.length - 1];
                    while (lastOperator !== undefined && lastOperator.type === 'Operator' //!== undefined check that operatorStack isn't empty
                    &&                         // checking for priority
                        (precedence[token.value] <= precedence[lastOperator.value])
                    ) {

                        queue.push(operatorStack.pop());
                        lastOperator = operatorStack[operatorStack.length - 1];
                    }
                }
                operatorStack.push(token);
                break;
            case "LeftParenthesis":
                operatorStack.push(token);
                break;
            case "RightParenthesis":
                while(operatorStack[operatorStack.length - 1].type !== 'LeftParenthesis') {
                    queue.push(operatorStack.pop());
                }
                operatorStack.pop();
                break;
        }
    });

    // add remaining operators
    operatorStack.reverse().map(function (el) {
        queue.push(el);
    });

    let stack = [];

    queue.forEach(function (el) {
        switch (el.type) {
            case 'Operator':
                let b = stack.pop(); // take the last element
                let a = stack.pop(); //and the previous one
                stack.push({
                    'type': 'Literal',
                    'value': operator[el.value](a.value, b.value) //
                });
                break;
            case 'Literal':
                stack.push(el);
                break;
        }
    });

    return stack.pop().value; //the last element = result element;
}


module.exports = {
    expressionCalculator
}
