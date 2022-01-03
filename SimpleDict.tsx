import { makeAutoObservable, observable, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import FS from 'react-native-fs';
import { Button } from './Button';

type Word = {
  id: number;
  bare: string;
  accented: string;
  usage_en: string;
  type: string;
  level: string;
};

class Dict {
  _words: Word[] = [];
  _loading: boolean = false;
  _filter: string = ''; // We will update filter from filterInputValue, but with debounce
  _filterInputValue: string = '';

  constructor() {
    // Each Word is immutable, so no need to waste time and make it observable, just collection should be enough
    makeAutoObservable(this, { _words: observable.shallow });
    reaction(
      () => this._filterInputValue,
      (val) => {
        this._filter = val;
      },
      { delay: 300 },
    );
  }

  async load() {
    this._loading = true;
    let content = '';
    if (Platform.OS === 'android') {
      content = await FS.readFileAssets('words.json', 'utf8');
    } else {
      content = await FS.readFile(`${FS.MainBundlePath}/words.json`, 'utf8');
    }
    const words = JSON.parse(content) as Word[];
    words.sort((a, b) => (a.bare < b.bare ? -1 : a.bare > b.bare ? 1 : 0));
    this.setDictData(words);
  }

  private setDictData(words: Word[]) {
    this._words = words;
    this._loading = false;
  }

  get isLoading(): boolean {
    return this._loading;
  }

  get filteredWords(): Word[] {
    if (this._filter) {
      const filter = this._filter;
      const ret: Word[] = [];
      for (const w of this._words) {
        if (w.bare.indexOf(filter) !== -1) {
          ret.push(w);
        }
      }
      return ret;
    }
    return this._words.slice();
  }

  setFilter = (val: string) => {
    this._filterInputValue = val;
  };

  addWord = () => {
    this._words.push({
      id: 1000000,
      accented: 'АБВГДЕ',
      bare: 'АБВГДЕ',
      level: '',
      type: 'noun',
      usage_en: '',
    });
    console.log('addWord');
    this._words.sort((a, b) => (a.bare < b.bare ? -1 : a.bare > b.bare ? 1 : 0));
  };
}

export const SimpleDictScreen = observer(() => {
  const [dict] = React.useState(() => new Dict());
  return (
    <SafeAreaView style={styles.container}>
      {dict.isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : null}
      <Button title="Add item" onPress={dict.addWord} />
      <TextInput
        style={styles.filter}
        placeholder="Filter..."
        defaultValue=""
        onChangeText={dict.setFilter}
        autoCapitalize="none"
      />
      <WordsList dict={dict} />
    </SafeAreaView>
  );
});

// 1. We have to guard FlatList outside to not rerender without the need
type WordsListProps = { dict: Dict };
const WordsList = observer(({ dict }: WordsListProps) => (
  <FlatList
    data={dict.filteredWords}
    renderItem={(info) => <WordItem word={info.item} />}
    ListEmptyComponent={() => (
      <Button
        title="Load data"
        onPress={() => {
          dict.load();
        }}
      />
    )}
    keyExtractor={(item) => `item-${item.id}`}
    // debug
    removeClippedSubviews={false}
  />
));

// 2. We have to guard each item to not rerender needlesly
type WordItemProps = { word: Word };
const WordItem = observer(({ word }: WordItemProps) => {
  console.log(`WordItem[${word.bare}] render`);
  return (
    <View style={styles.item}>
      <Text>
        {word.bare} [{word.accented}]
      </Text>
      <Text>
        {word.type} {word.level}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  filter: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
});
