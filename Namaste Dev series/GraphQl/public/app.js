document.addEventListener('DOMContentLoaded', () => {
    const querySelector = document.getElementById('query-selector');
    const queryPreview = document.getElementById('query-preview');
    const resultsContainer = document.getElementById('results-container');
    const runQueryButton = document.getElementById('run-query');
    const variablesContainer = document.getElementById('variables-container');
    
    // GraphQL query templates
    const queries = {
        allAuthors: `query {
  authors {
    id
    name
  }
}`,
        allBooks: `query {
  books {
    id
    title
    publishedYear
  }
}`,
        authorWithBooks: `query {
  authors {
    id
    name
    books {
      id
      title
      publishedYear
    }
  }
}`,
        bookWithAuthor: `query {
  books {
    id
    title
    publishedYear
    author {
      id
      name
    }
  }
}`,
        addAuthor: `mutation ($name: String!) {
  addAuthor(name: $name) {
    id
    name
  }
}`,
        addBook: `mutation ($title: String!, $publishedYear: Int!, $authorId: ID!) {
  addBook(title: $title, publishedYear: $publishedYear, authorId: $authorId) {
    id
    title
    publishedYear
    author {
      id
      name
    }
  }
}`
    };

    // Variables required for each query
    const queryVariables = {
        allAuthors: [],
        allBooks: [],
        authorWithBooks: [],
        bookWithAuthor: [],
        addAuthor: [
            { name: 'name', label: 'Author Name', type: 'text' }
        ],
        addBook: [
            { name: 'title', label: 'Book Title', type: 'text' },
            { name: 'publishedYear', label: 'Published Year', type: 'number' },
            { name: 'authorId', label: 'Author ID', type: 'text' }
        ]
    };

    // Update query preview when selection changes
    querySelector.addEventListener('change', updateQueryInterface);
    
    // Execute query when button is clicked
    runQueryButton.addEventListener('click', executeQuery);

    // Initialize the interface
    updateQueryInterface();

    function updateQueryInterface() {
        const selectedQuery = querySelector.value;
        queryPreview.textContent = queries[selectedQuery];
        
        // Update variable inputs
        updateVariableInputs(selectedQuery);
    }

    function updateVariableInputs(queryType) {
        variablesContainer.innerHTML = '';
        const variables = queryVariables[queryType];
        
        if (variables.length > 0) {
            variablesContainer.classList.remove('hidden');
            
            variables.forEach(variable => {
                const div = document.createElement('div');
                div.className = 'variable-input';
                
                const label = document.createElement('label');
                label.textContent = variable.label;
                label.setAttribute('for', `var-${variable.name}`);
                
                const input = document.createElement('input');
                input.type = variable.type;
                input.id = `var-${variable.name}`;
                input.name = variable.name;
                input.required = true;
                
                div.appendChild(label);
                div.appendChild(input);
                variablesContainer.appendChild(div);
            });
        } else {
            variablesContainer.classList.add('hidden');
        }
    }

    async function executeQuery() {
        const selectedQuery = querySelector.value;
        const query = queries[selectedQuery];
        
        // Collect variables if any
        const variables = {};
        const variableInputs = document.querySelectorAll('#variables-container input');
        
        variableInputs.forEach(input => {
            const name = input.name;
            let value = input.value;
            
            // Convert to appropriate type
            if (input.type === 'number') {
                value = parseInt(value, 10);
            }
            
            variables[name] = value;
        });

        try {
            // Show loading state
            resultsContainer.textContent = 'Loading...';
            
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: Object.keys(variables).length > 0 ? variables : undefined
                })
            });
            
            const result = await response.json();
            
            // Pretty-print JSON with 2-space indentation
            resultsContainer.textContent = JSON.stringify(result, null, 2);
            
        } catch (error) {
            resultsContainer.textContent = `Error: ${error.message}`;
            console.error('Error executing GraphQL query:', error);
        }
    }
});
