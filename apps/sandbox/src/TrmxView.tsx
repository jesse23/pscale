import { Allotment } from 'allotment';
import { CodeEditor } from './CodeEditor';
import { useEffect, useState } from 'react';
import { trmx } from '@pscale/trmx';
import styles from './View.module.css';
import 'allotment/dist/style.css';
import { evalExpression } from '@pscale/util';
import { Options } from 'libs/trmx/src/types';

const EXAMPLE = {
  xml: {
    rules: [
      `m | owner.__child>ref.uid      | owner.uid`,
      'm | product.owned_by           | product.owned_by>owner.uid',
      `t | product.name               | item.__text`,
      't | owner.uid                  | user.uid ',
      't | owner.name                 | user.name ',
      `t | owner<owned_by.product     | user.__child>item`,
    ],
    config: [
      `
{
  in: {
    format: 'xml'
  },
  out: {
    format: 'xml',
    template: (ds) => ({
      __root: {
        __type: 'xml',
        __child: ds.user,
      },
    })
  }
}
  `,
    ],
    source: [
      '<data>',
      '  <product id="id1" name="product 1" owned_by="uid1" />',
      '  <product id="id2" name="product 2" owned_by="uid1" />',
      '  <owner id="id3" name="owner 1">',
      '    <ref uid="uid1" />',
      '  </owner>',
      '</data>',
    ],
  },
  json: {
    rules: [
      't | product.name               | item.name ',
      't | product.owned_by>user.name | item<items.user.name',
    ],
    config: [
      `
{
  in: {
    format: 'json',
    template: (ds) => ({
      product: ds.data,
      user: ds.data.map(p => p.owned_by)
    }),
  },
  out: {
    format: 'json',
    template: (ds) => ({
      data: ds.user
    }),
  },
}
  `,
    ],
    source: [
      `
{
  "data": [
    {
      "name": "product 1",
      "owned_by": {
        "name": "owner 1"
      }
    },
    {
      "name": "product 2",
      "owned_by": {
        "name": "owner 2"
      }
    }
  ]
}
  `,
    ],
  },
};

export default function TrmxPanel() {
  // rules
  const [rules, setRules] = useState(EXAMPLE.xml.rules.join('\n').trim());

  // config
  const [cfg, setCfg] = useState(EXAMPLE.xml.config.join('\n').trim());

  // source
  const [src, setSrc] = useState(EXAMPLE.xml.source.join('\n').trim());

  // target
  const [tar, setTar] = useState('/* target */');

  useEffect(() => {
    try {
      const tar = trmx(src.split('\n'), {
        ...(evalExpression(cfg, {}) as Options),
        rules: rules.split('\n'),
      });
      setTar(tar.join('\n'));
    } catch (e) {
      setTar((e as Error).message);
    }
  }, [rules, src, tar, cfg]);

  return (
    <div className={styles.container}>
      <Allotment minSize={400}>
        {/* Left Pane - Rule + Config */}
        <Allotment.Pane>
          <Allotment vertical>
            <Allotment.Pane minSize={100}>
              <CodeEditor code={rules} type="js" onChange={setRules} />
            </Allotment.Pane>
            <Allotment.Pane snap>
              <CodeEditor code={cfg} type="js" onChange={setCfg} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        {/* Right Pane - Source + Target */}
        <Allotment.Pane minSize={400}>
          <Allotment vertical>
            <Allotment.Pane minSize={100}>
              <CodeEditor code={src} type="js" onChange={setSrc} />
            </Allotment.Pane>
            <Allotment.Pane snap>
              <CodeEditor code={tar} type="js" onChange={setTar} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
