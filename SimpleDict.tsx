import { makeAutoObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, FlatList, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
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

  get orderedWords() {
    return this._words.slice().sort((a, b) => (a.bare < b.bare ? -1 : a.bare > b.bare ? 1 : 0));
  }
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
      <FlatList
        data={dict.orderedWords}
        renderItem={(info) => (
          <View style={styles.item}>
            <Text>
              {info.item.bare} [{info.item.accented}]
            </Text>
            <Text>
              {info.item.type} {info.item.level}
            </Text>
          </View>
        )}
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
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
