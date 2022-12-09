



const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodo) => {
        // post
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const removeTodo = (id) => {
        return fetch(URL + `/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch(URL).then((res) => res.json());
    };

    const editTodos = (editTodo,id) => {
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: editTodo,
                id: id,
                completed: false
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
    };

    const isCompleted = (title, id,) => {
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: title,
                id: id,
                completed: true
            }),
            headers:{
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
    }

    const isNotComplete = (title, id) => {
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: title,
                id: id,
                completed: false
            }),
            headers:{
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
    }


    return {
        addTodo,
        removeTodo,
        getTodos,
        editTodos,
        isCompleted,
        isNotComplete
    };
})();

const Model = (() => {
    //todolist
    class State {
        #todos; //[{id: ,title: },{}]
        #onChange;
        constructor() {
            this.#todos = [];
        }
        todosId (id) {
            return this.#todos[{id: id}];
        }

        get todos() {
            return this.#todos;
        }

        set todos(newTodo) {
            console.log("setter");
            this.#todos = newTodo;
            //const obj = {name:"adam"};
            //obj.age //undefined
            //obj.age(); //error
            this.#onChange?.();
        }

        subscribe(callback) {
            this.#onChange = callback;
        }
    }
    let { getTodos, removeTodo, addTodo } = APIs;

    return {
        State,
        getTodos,
        removeTodo,
        addTodo,
    };
})();


const View = (() => {
    const formEl = document.querySelector(".form"); //querying
    const todoListEl = document.querySelector(".todo-list");
    const updateTodoList = (todos) => {
        let template = "";
        todos.forEach((todo) => {
            const todoTemplate = `<li class="list" id="${todo.id}"><span class="input-text" id="${todo.id}">${todo.title}</span><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
            // const todoTemplate = `<li><input type="text" value="${todo.title}"><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
            template += todoTemplate;
        });
        if(todos.length === 0){
            template = "no task to display"
        }
        todoListEl.innerHTML = template;
    };

    const changetodoTemplate = (todos, id) => {
        let template = "";
        todos.forEach((todo) => {

            if (+id === +todo.id){
                const todoTemplate = `<li class="input-list" id="${todo.id}"><input id="editText" type="text" value="${todo.title}"><button class="btn--edit-submit" id="${todo.id}">submit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                template += todoTemplate;
            } else {
                const todoTemplate = `<li class="input-list" id="${todo.id}"><span class="input-text" id="${todo.id}">${todo.title}</span><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                template += todoTemplate;
            }
        });
        todoListEl.innerHTML = template;
    }
    const changebacktoOriginalTemplate = (todos, id, title) => {
        let template = "";
        todos.forEach((todo) => {

            if (+id === +todo.id){
                const todoTemplate = `<li class="input-list" id="${todo.id}"><span class="input-text" id="${todo.id}">${title}</span><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                template += todoTemplate;

            } else {
                const todoTemplate = `<li class="input-list" id="${todo.id}"><span class="input-text" id="${todo.id}">${todo.title}</span><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                template += todoTemplate;

            }
        });
        todoListEl.innerHTML = template;
    }
    return {
        formEl,
        todoListEl,
        updateTodoList,
        changetodoTemplate,
        changebacktoOriginalTemplate
    };
})();


const ViewModel = ((View, Model) => {
    console.log("model", Model);
    const state = new Model.State();

    const getTodos = () => {
        Model.getTodos().then((res) => {
            state.todos = res;
        });
    };

    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = event.target[0].value;
            console.log(event.target[0])
            if(title.trim() === "") {
                alert("please input title!");
                return;
            }
            const newTodo = { title: title , 
            completed: false};
            Model.addTodo(newTodo)
                .then((res) => {
                    state.todos = [res, ...state.todos];
                    event.target[0].value = ""
                })
                .catch((err) => {
                    alert(`add new task failed: ${err}`);
                });
        });
    };
   

    const editTodo = () => {
        View.todoListEl.addEventListener("click",(event)=>{
            const id = event.target.id;

            if (event.target.className === "btn--edit"){
                View.changetodoTemplate(state.todos,+id)

            }
            if (event.target.className === "btn--edit-submit"){
                console.log(event.target);
                const title = document.getElementById('editText').value
                // (edit)state(save) -> db(post)
                View.changebacktoOriginalTemplate(state.todos,+id,title)
                APIs.editTodos(title, id).then(res =>
                    state.todos = res);


            }
        })
    };

    const isCompleted = () => {
        View.todoListEl.addEventListener("click", (event) =>{
            const id = event.target.id;
            const title = event.target.innerText;
            APIs.isCompleted(title, id);
            View.updateTodoList(state.todos);
            if (event.target.className === "input-text"){
                state.todos.forEach((todo) => {
                    if (todo.completed == true) {
                        console.log(todo);
                    }

                });
            }
            else{
                return
            }
            
        })
    }

    // const isNotComplete = () => {
    //     View.todoListEl.addEventListener("click", (event) => {
    //         const id = event.target.id;
    //         const title = event.target.innerText;
    //         APIs.isNotComplete(title, id)

    //     })
    // }


    const removeTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            //console.log(event.target/* emit the event */, event.currentTarget/* receive the event */);
            const id = event.target.id;
            //console.log("id", id)
            if(event.target.className === "btn--delete"){
                Model.removeTodo(id).then(res=>{
                    state.todos = state.todos.filter(todo=> +todo.id !== +id)
                }).catch(err=>alert(`delete todo failed: ${err}`))
            }
            

        })
    };

    const bootstrap = () => {
        addTodo();
        getTodos();
        removeTodo();
        editTodo();
        isCompleted();
        state.subscribe(() => {
            View.updateTodoList(state.todos);
        });
    };

    return {
        bootstrap,
    };
})(View, Model);

ViewModel.bootstrap();


/*
I ran into too many bugs during this process and just wanted to take the time to explain what I was trying to do before the numerous bugs
forced me to restart on a separate  file. I was able to have an edit button that changed the already written text into a textbox that can 
be altered and saved to the db.json. Then I tried to create a function that would change the completed status of a clicked task and change
it in the db.json. As soon as I finished that I started making another function that would change the completed status back. I then knew I
needed to strike through the text but then it would bleed that stricken text to several tasks. but if that process had worked I already 
began allocating space in the html that would acccept a new list of completed tasks. I wish I could've done better in the time I had I hope 
you can see that I tried my best and would love an opportunity to improve at Antra 


*/