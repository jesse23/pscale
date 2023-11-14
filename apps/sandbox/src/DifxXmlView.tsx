import { Allotment } from 'allotment';
import { CodeEditor } from './CodeEditor';
import { useEffect, useState } from 'react';
import { diff, apply, view, ViewNode } from '@pscale/difx';
import styles from './View.module.css';
import 'allotment/dist/style.css';
import DifxNodeViewPanel from './DifxNodeViewPanel';
import { nodeFromXML, nodeToXML } from '@pscale/trmx';
import { evalExpression, isObject } from '@pscale/util';

const EXAMPLE = {
  source: [
    `
<rules>
  <node>
    <rule>Has Type</rule>
    <arg>root_type</arg>
    <act></act>
    <node>
      <rule>Has Bypass</rule>
      <arg>true</arg>
      <act>Bypass</act>
    </node>
    <node collapse="true" protected="true">
      <rule>Has Type</rule>
      <arg>root_type</arg>
      <act>System Objects</act>
      <node>
        <rule>Is Archived</rule>
        <arg>true</arg>
        <act>Archived Objects</act>
      </node>
      <node>
        <rule>Owning User</rule>
        <arg>admin</arg>
        <act>System</act>
        <node>
          <rule>Has Type</rule>
          <arg>sub_type_lv1</arg>
          <act></act>
        </node>
        <node>
          <rule>Has Type</rule>
          <arg>ConfigRule</arg>
          <act>Public Rule</act>
        </node>
        <node>
          <rule>In Current Program</rule>
          <arg>false</arg>
          <act>Not Current Program</act>
        </node>
      </node>
    </node>
    <node>
      <rule>Has Class</rule>
      <arg>sub_type_lv1</arg>
      <acl_name/>
      <node>
        <rule>Inactive Sequence</rule>
        <arg>true</arg>
        <act>Inactive Sequence Objects</act>
      </node>
    </node>
  </node>
</rules>
    `,
  ],
  target: [
    `
<rules>
  <node>
    <rule>Has Type</rule>
    <arg>root_type</arg>
    <act></act>
    <node collapse="true" protected="true">
      <rule>Has Type</rule>
      <arg>root_type</arg>
      <act>System Objects</act>
      <node>
        <rule>Is Archived</rule>
        <arg>true</arg>
        <act>Archived Objects</act>
      </node>
      <node>
        <rule>Owning User</rule>
        <arg>non-admin</arg>
        <act>System</act>
        <node>
          <rule>Has Class</rule>
          <arg>root</arg>
          <act></act>
        </node>
        <node>
          <rule>Has Type</rule>
          <arg>ConfigRule</arg>
          <act>Public Rule</act>
        </node>
        <node>
          <rule>Has Type</rule>
          <arg>sub_type_lv1</arg>
          <act></act>
        </node>
        <node>
          <rule>In Current Program</rule>
          <arg>false</arg>
          <act>Not Current Program</act>
        </node>
      </node>
    </node>
    <node>
      <rule>Has Class</rule>
      <arg>sub_type_lv1</arg>
      <acl_name/>
      <node>
        <rule>Inactive Sequence</rule>
        <arg>true</arg>
        <act>Inactive Sequence Objects</act>
      </node>
    </node>
  </node>
</rules>
    `,
  ],
  config: [
    `
{
  reorder: true,
  key: 'id',
  tag:'__type',
  name: 'rule',
  fuzzy: 0.1,
}
    `.trim(),
  ],
};

export default function DifxXmlView() {
  // source
  const [src, setSrc] = useState(EXAMPLE.source.join('\n').trim());
  const [tar, setTar] = useState(EXAMPLE.target.join('\n').trim());
  const [config, setConfig] = useState(EXAMPLE.config.join('\n').trim());
  const [viewNodes, setViewNodes] = useState([] as ViewNode[]);
  const [result, setResult] = useState('/* result */');

  useEffect(() => {
    try {
      const srcData = nodeFromXML(src.split('\n'), {
        elem_as: 'attr',
        attr_prefix: '_',
      });
      const tarData = nodeFromXML(tar.split('\n'), {
        elem_as: 'attr',
        attr_prefix: '_',
      });
      const configs = evalExpression(config) as Record<string, unknown>;
      // option to xml without id and name
      // const opts = { reorder: true, key: '__type', tag:'__type', name: '__type' };
      const patch = diff(srcData, tarData, configs);
      const nodes = view(srcData, patch, configs);
      setViewNodes(() => nodes);
      const final = apply(srcData, patch, configs);
      if (isObject(final)) {
        const entries = Object.entries(final);
        const [tag, node] = entries[0];
        if (entries.length === 1 && isObject(node)) {
          setResult(() =>
            nodeToXML(node, tag, { elem_as: 'attr', attr_prefix: '_' }).join(
              '\n'
            )
          );
        } else {
          setResult(() => `Only support Record<string, Record<string, unknown>> with one top level entry for now`);
        }
      }
    } catch (e) {
      setResult((e as Error).stack || '');
      // throw e;
    }
  }, [src, tar, config]);

  return (
    <div className={styles.container}>
      <Allotment vertical defaultSizes={[75, 100]}>
        <Allotment.Pane minSize={100}>
          <Allotment defaultSizes={[100, 100, 100]}>
            <Allotment.Pane>
              <CodeEditor code={src} type="js" onChange={setSrc} />
            </Allotment.Pane>
            <Allotment.Pane>
              <CodeEditor code={tar} type="js" onChange={setTar} />
            </Allotment.Pane>
            <Allotment.Pane>
              <CodeEditor code={config} type="js" onChange={setConfig} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane snap>
          <Allotment defaultSizes={[200, 100]}>
            <Allotment.Pane>
              <DifxNodeViewPanel nodes={viewNodes} />
            </Allotment.Pane>
            <Allotment.Pane>
              <CodeEditor code={result} type="js" onChange={setResult} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
