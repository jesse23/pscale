import { cloneDeepJsonObject, evalExpression } from './utils';

describe('Test evalExpression', () => {
    it('Verify evalExpression can fetch value', () => {
        const obj = {
            b: {
                c: 'test'
            }
        };
        expect(evalExpression('a.b.c', { a: obj })).toEqual('test');
    });

    it('Verify evalExpression can do basic calculation', () => {
        expect(evalExpression('a + b', {
            a: 3,
            b: 2
        })).toEqual(5);
    });

    it('Verify evalExpression can evaluate string template', () => {
        // eslint-disable-next-line no-template-curly-in-string
        expect(evalExpression('`Hello ${val}`', {
            val: 'John'
        })).toEqual('Hello John');
    });

    it('Verify evalExpression can evaluate condition', () => {
        const testObj = {
            prop: {
                user_name: 'Lucy',
                password: 'unset'
            }
        };

        expect(evalExpression('selected.prop[prop_name] === "Lucy"', {
            selected: testObj,
            prop_name: 'user_name'
        })).toEqual(true);
    });

    it('Verify evalExpression can error out if syntax error', () => {
        expect(() => evalExpression('selected.prop[prop_n', {}))
            .toThrowError(/evalExpression\('selected.prop\[prop_n'\) => Unexpected token/);
    });

    it('Verify evalExpression can error out if runtime error', () => {
        expect(() => evalExpression('a.b.c', {
            a: 3
        })).toThrowError('evalExpression(\'a.b.c\') => Cannot read properties of undefined (reading \'c\')');
    });

    it('Verify evalExpression can run statement without input', () => {
        expect(evalExpression('"3"')).toEqual('3');
    });
});

describe('Test cloneDeepJsonObject', () => {
    it('Verify cloneDeepJsonObject works correctly with valid input', () => {
        const vm = {
            action: {
                input: '{aaa}',
                output: '{bbb}'
            },
            data: {
                test: {
                    test1: 'ccc'
                }
            }
        };

        expect(cloneDeepJsonObject(vm)).toEqual(vm);
    });

    it('Verify cloneDeepJsonObject with undefined', () => {
        expect(cloneDeepJsonObject(undefined)).toEqual(undefined);
    });

    it('Verify cloneDeepJsonObject with string', () => {
        expect(cloneDeepJsonObject('aaa')).toEqual('aaa');
    });

    it('Verify cloneDeepJsonObject with number', () => {
        expect(cloneDeepJsonObject(3)).toEqual(3);
    });

    it('Verify cloneDeepJsonObject with boolean', () => {
        expect(cloneDeepJsonObject(true)).toEqual(true);
    });

    it('Verify cloneDeepJsonObject with array', () => {
        expect(cloneDeepJsonObject([2, 3])).toEqual([2, 3]);
    });
});

