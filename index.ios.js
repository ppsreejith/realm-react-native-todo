'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  AlertIOS
} from 'react-native';

import { ListView } from 'realm/react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
const Realm = require('realm');

class TodoItem extends Component {
  shouldComponentUpdate(nProps) {
    return this.props.todo.id != nProps.todo.id;
  }
  
  render() {
    const {todo} = this.props;
    console.log("Rerendered Item is", todo.id);
    
    return (
      <TouchableHighlight key={todo.id} underlayColor="rgba(181, 206, 155, 0.79)" onPress={onPressComplete(todo)}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>{todo.text}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}

const onPressComplete = (item) => {
  return () => {
    AlertIOS.prompt(
      'Complete',
      null,
      [
        {text: 'Complete', onPress: (text) => 
          realm.write(()=> {
            var all = realm.objects('Todo');
            let filterTodo = all.filtered(`id = ${item.id}`);
            realm.delete(filterTodo);
          })
        },
        {text: 'Cancel', onPress: (text) => console.log('Cancel')}
      ],
      'default'
    );
  }
};

// schema
const TodoListSchema = { 
    name: 'Todo', primaryKey: 'id', properties:{id: 'int', text: 'string'}
};

// new realm object
let realm = new Realm({schema:[TodoListSchema]});

class realmTodo extends Component {
   
  constructor(props) {
      super(props);
      this.state = {
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1.id !== row2.id,
          })
      };
    this.renderTodo = this.renderTodo.bind(this);
  }
          
  fetchData(itemsRef) {
      var todoList = realm.objects('Todo');
      
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(todoList),
        });
      
        this.syncData(todoList);     
  } 
    
  syncData(todoList) {
      realm.addListener('change', () => {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(todoList),
        });
      });
  } 
    
  componentDidMount() {
      this.fetchData();
  }
   
  render() {
    return (
        <View style={styles.container}>
           <ListView 
                dataSource={this.state.dataSource}
                renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
                renderRow={this.renderTodo}
                style={styles.listView}
            />
        
            <View style={styles.button}>
                <TouchableHighlight style={styles.buttonHighlight} underlayColor='#43A047' onPress={this.addList}>
                    <Text style={styles.buttonText}>ADD</Text>
                </TouchableHighlight>    
            </View>
        </View>  
    );
  }
   
   // add items
   addList() {
       
    AlertIOS.prompt(
      'Add New Todo',
      null,
      [
        {
          text: 'Add',
          onPress: (text) => {
            realm.write(()=> {
            realm.create('Todo', [Date.now(), text]);
            });           
          }
        },
      ],
      'plain-text'
    );
       
  }  
    
  renderTodo(todo) {
    // complete todo
 
      return (
        <TodoItem todo={todo} />
      );
  } 
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
   listView: {
     flex: 1,
     marginTop: 25
   },
   listItem: {
       borderWidth: 1,
       borderColor: 'transparent',
       borderBottomColor: '#eee',
       paddingLeft: 16,
       paddingTop: 14,
       paddingBottom: 16,
   },
   listText: {
       color: '#333',
       fontSize: 17,
       textAlign: 'center'
   },
    button: {
       borderWidth: 1,
       borderColor: 'transparent',
       backgroundColor: '#4CAF50',    
    },
    buttonHighlight: {
       padding: 10
    },
    buttonText: {
       fontSize: 20,
       fontWeight: 'bold',
       color: 'white',
       textAlign: 'center'
    }
});

AppRegistry.registerComponent('realmTodo', () => realmTodo);
