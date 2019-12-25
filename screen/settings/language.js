import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { BlueLoading, BlueText, SafeBlueArea, BlueListItem, BlueCard, BlueNavigationStyle } from '../../BlueComponents';
import { Icon } from 'react-native-elements';
let loc = require('../../loc');

const Language = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const availableLanguages = [
    { label: 'English', value: 'en' },
    { label: 'Afrikaans (AFR)', value: 'zar_afr' },
    { label: 'Chinese (ZH)', value: 'zh_cn' },
    { label: 'Chinese (TW)', value: 'zh_tw' },
    { label: 'Croatian (HR)', value: 'hr_hr' },
    { label: 'Česky (CZ)', value: 'cs_cz' },
    { label: 'Danish (DK)', value: 'da_dk' },
    { label: 'Deutsch (DE)', value: 'de_de' },
    { label: 'Español (ES)', value: 'es' },
    { label: 'Ελληνικά (EL)', value: 'el' },
    { label: 'Italiano (IT)', value: 'it' },
    { label: 'Suomi (FI)', value: 'fi_fi' },
    { label: 'Français (FR)', value: 'fr_fr' },
    { label: 'Indonesia (ID)', value: 'id_id' },
    { label: 'Magyar (HU)', value: 'hu_hu' },
    { label: '日本語 (JP)', value: 'jp_jp' },
    { label: 'Nederlands (NL)', value: 'nl_nl' },
    { label: 'Norsk (NB)', value: 'nb_no' },
    { label: 'Português (BR)', value: 'pt_br' },
    { label: 'Português (PT)', value: 'pt_pt' },
    { label: 'Русский', value: 'ru' },
    { label: 'Svenska (SE)', value: 'sv_se' },
    { label: 'Thai (TH)', value: 'th_th' },
    { label: 'Vietnamese (VN)', value: 'vi_vn' },
    { label: 'Українська', value: 'ua' },
    { label: 'Türkçe (TR)', value: 'tr_tr' },
    { label: 'Xhosa (XHO)', value: 'zar_xho' },
  ];

  useEffect(() => {
    setIsLoading(false);
  });

  const renderItem = ({ item }) => {
    return (
      <BlueListItem
        Component={TouchableOpacity}
        onPress={() => {
          console.log('setLanguage', item.value);
          loc.saveLanguage(item.value);
          setLanguage(item.value);
        }}
        title={item.label}
        {...(language === item.value
          ? {
              rightIcon: <Icon name="check" type="font-awesome" color="#0c2550" />,
            }
          : { hideChevron: true })}
      />
    );
  };

  return isLoading ? (
    <BlueLoading />
  ) : (
    <SafeBlueArea forceInset={{ horizontal: 'always' }} style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={(_item, index) => `${index}`}
        data={availableLanguages}
        extraData={availableLanguages}
        renderItem={renderItem}
      />
      <BlueCard>
        <BlueText>When selecting a new language, restarting BlueWallet may be required for the change to take effect.</BlueText>
      </BlueCard>
    </SafeBlueArea>
  );
};

Language.navigationOptions = () => ({
  ...BlueNavigationStyle(),
  title: 'Language',
});

export default Language;
