import React from 'react';
import {
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {makeAutoObservable} from 'mobx';
import {observer} from 'mobx-react-lite';

class Item {
  selected: boolean = false;

  constructor(readonly id: string) {
    makeAutoObservable(this);
  }

  onPress = () => {
    LayoutAnimation.easeInEaseOut();
    this.selected = !this.selected;
  };
}

class List {
  items: Item[] = [];

  get orderedItems(): Item[] {
    const remaining = this.items.slice();
    const result: Item[] = [];
    let current: Item[] = [];
    while (remaining.length > 0) {
      const currentWidth = getItemsWidth(current);
      const idx = remaining.findIndex(
        item => currentWidth + getItemWidth(item) <= 2,
      );
      if (idx >= 0) {
        const [item] = remaining.splice(idx, 1);
        if (!item) {
          break;
        }

        current.push(item);
        if (getItemsWidth(current) >= 2) {
          result.push(...current);
          current = [];
        }
      } else {
        result.push(...remaining);
        result.push(...current);
        current = [];
        break;
      }
    }
    if (current.length > 0) {
      result.push(...current);
    }
    return result;
  }

  constructor() {
    makeAutoObservable(this);
    for (let i = 0; i < 20; i++) {
      this.items.push(new Item(`Item${i + 1}`));
    }
  }
}

function getItemsWidth(items: Item[]): number {
  let width = 0;
  for (const item of items) {
    width += getItemWidth(item);
  }
  return width;
}

function getItemWidth(item: Item): number {
  return item.selected ? 2 : 1;
}

const list = new List();

const App = observer(() => {
  return (
    <SafeAreaView style={{flexDirection: 'row', flexWrap: 'wrap'}}>
      {list.orderedItems.map(item => (
        <ItemView key={item.id} item={item} />
      ))}
    </SafeAreaView>
  );
});

const ItemView = observer((props: {item: Item}) => {
  const item = props.item;
  return (
    <View style={{width: item.selected ? '100%' : '50%', flexDirection: 'row'}}>
      <Pressable
        onPress={item.onPress}
        style={{
          backgroundColor: 'red',
          borderRadius: 10,
          height: 20,
          flex: 1,
          margin: 5,
        }}>
        <Text>{item.id}</Text>
      </Pressable>
    </View>
  );
});

export default App;
