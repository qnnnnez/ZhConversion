WIKIPEDIA_ZHCONV_PHP_URL = 'https://phabricator.wikimedia.org/source/mediawiki/browse/master/languages/data/ZhConversion.php?view=raw'

import json
import re
import requests
session = requests.Session()


def get_conv_table(raw_php, name):
    begin = raw_php.find('$' + name)
    end = raw_php.find(']', begin + 1)
    raw_table = raw_php[begin:end]
    result = {}
    for line in raw_table.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.replace(',', '').split('=>')
        if len(parts) != 2:
            continue
        match, replace = parts
        match = match.strip().replace("'", '')
        replace = replace.strip().replace("'", '')
        result[match] = replace
    return result

def gen_js_func(conv_map):
    m = list(conv_map.items())
    m.sort(key=lambda k: len(k[0]), reverse=True)
    regex = '|'.join(re.escape(k) for k, v in m)

    char_conv = {
        'regex': regex,
        'replace_map': conv_map
    }
    template = open('template.js', encoding='utf-8').read()
    return template.replace('__CHAR_CONV__', json.dumps(char_conv, ensure_ascii=False))

def main():
    php = session.get('https://phabricator.wikimedia.org/source/mediawiki/browse/master/languages/data/ZhConversion.php?view=raw').text
    test = get_conv_table(php, 'zh2Hans')
    test.update(get_conv_table(php, 'zh2CN'))
    test = gen_js_func(test)
    open('zhconv.user.js', 'w', encoding='utf-8').write(test)

if __name__ == '__main__':
    main()
