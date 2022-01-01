import { makeAutoObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, FlatList, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import FS from 'react-native-fs';

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
  _filter: string = '';

  constructor() {
    // Each Word is immutable, so no need to waste time and make it observable, just collection should be enough
    makeAutoObservable(this, { _words: observable.shallow });
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
    return this._words;
  }

  setFilter = (val: string) => {
    this._filter = val;
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
    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
    keyExtractor={(item) => `item-${item.id}`}
  />
));

// 2. We have to guard each item to not rerender needlesly
type WordItemProps = { word: Word };
const WordItem = observer(({ word }: WordItemProps) => (
  <View style={styles.item}>
    <Text>
      {word.bare} [{word.accented}]
    </Text>
    <Text>
      {word.type} {word.level}
    </Text>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
  },
  listSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 8,
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
