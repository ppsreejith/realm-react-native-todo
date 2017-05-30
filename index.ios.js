'use strict';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  AlertIOS
} from 'react-native';

import React, { Component } from 'react';
import { ListView } from 'realm/react-native';
//import InvertibleScrollView from 'react-native-invertible-scroll-view';
const Realm = require('realm');

const ITEM_STATUS = {
  DELETED: 0,
  ACTIVE: 1,
};

const _itemStatus = {};

const has_changed = (r1, r2) => {
  try {
    return r1.id != r2.id || _itemStatus[r1.id] != r2.status;
  } catch(e) {
    return true;
  }
}

class TodoItem extends Component {
  
  render() {
//    console.log("Rerendered :(");
    const {todo} = this.props;
    _itemStatus[todo.id] = todo.status;
    
    if (todo.status == ITEM_STATUS.DELETED)
      return null;
    
    return (
      <TouchableHighlight key={todo.id} underlayColor="rgba(181, 206, 155, 0.79)" onPress={onPressComplete(todo)} style={styles.invertedItem}>
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
            filterTodo[0].status = ITEM_STATUS.DELETED;
            //realm.delete(filterTodo[0]);
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
    name: 'Todo', primaryKey: 'id', properties:{id: 'int', text: 'string', status: 'int'}
};

// new realm object
let realm = new Realm({schema:[TodoListSchema]});

class realmTodo extends Component {
   
  constructor(props) {
      super(props);
      this.state = {
          dataSource: new ListView.DataSource({
            rowHasChanged: has_changed,
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
    // renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
    return (
        <View style={styles.container}>
           <ListView 
                dataSource={this.state.dataSource}
                renderRow={this.renderTodo}
                style={[styles.invertedItem, styles.listView]}
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
            realm.create('Todo', [Date.now(), text, ITEM_STATUS.ACTIVE]);
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
  invertedItem: {
    transform: [{ rotate: '180deg'}]
  },
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

AppRegistry.registerComponent('realm_react_native_todo', () => realmTodo);
