
class queryParser{
	
	constructor(queriesString){
		
		// Input string containing SQL queries
		this.queriesString = queriesString.trim();
		
		// The quote type (' or ") if the parser 
		// is currently inside of a quote, else false
		this.quoteType = false;
		
		// An array of complete queries
		this.queries = [];
		
		// An array of chars representing the substring
		// the is currently being parsed
		this.buffer = [];
		
		// Is the current char escaped
		this.escaped = false;
		
		// The string that denotes the end of a query
		this.delimiter = ';';
		
		// Are we currently seeking new delimiter
		this.seekingDelimiter = false;

		// Does the sql set change delimiter?
		this.hasDelimiter = queriesString.toLowerCase().includes('delimiter ');

		// Iterate over each char in the string
		for (let i = 0; i < this.queriesString.length; i++) {
			let char = this.queriesString[i];
			this.parseChar(char);
		}
	}
	
	// Parse the next char in the string
	parseChar(char){
		this.checkEscapeChar();
		this.buffer.push(char);

		if (this.hasDelimiter) {
			this.checkNewDelimiter(char);
		}

		this.checkQuote(char);
		this.checkEndOfQuery();
	}
	
	// Check if the current char has been escaped
	// and update this.escaped
	checkEscapeChar(){
		if(!this.buffer.length) return;
		if(this.buffer[this.buffer.length - 1] === "\\"){
			this.escaped = !this.escaped;
		}else{
			this.escaped = false;
		}
	}
	
	// Check to see if a new delimiter is being assigned
	checkNewDelimiter(char){
		var buffer_str = this.buffer.join('').toLowerCase().trim();
		if(buffer_str === 'delimiter' && !this.quoteType){
			this.seekingDelimiter = true;
			this.buffer = [];
		}else{
			var isNewLine = char === "\n" || char === "\r";
			if(isNewLine && this.seekingDelimiter){
				this.seekingDelimiter = false;
				this.delimiter = this.buffer.join('').trim();
				this.buffer = [];
			}
		}
	}
	
	// Check if the current char is a quote
	checkQuote(char){
		var isQuote = (char === '"' || char === "'") && !this.escaped;
		if (isQuote && this.quoteType === char){
			this.quoteType = false;
		}else if(isQuote && !this.quoteType){
			this.quoteType = char;
		}
	}
	
	// Check if we're at the end of the query
	checkEndOfQuery(){
		var demiliterFound = false;
		if(!this.quoteType && this.buffer.length >= this.delimiter.length){
			demiliterFound = this.buffer.slice(-this.delimiter.length).join('') === this.delimiter;
		}

		if (demiliterFound) {
			// trim the delimiter off the end
			this.buffer.splice(-this.delimiter.length, this.delimiter.length);
			this.queries.push(this.buffer.join(''));
			this.buffer = [];
		}
	}
}
