import path from 'path';
import Promise from 'bluebird';
import sut from './index';

describe('index', () => {
  const importer = sut({
    modules: [
      '@namespaced-styles',
      '@namespaced-components',
      'gridle'
    ]
  });

  const mockAbsolutePath = (relativePath) => {
    return path.join(__dirname, '../test', relativePath);
  };

  const runTest = (modulePath, prev = mockAbsolutePath('/src/index.scss')) => {
    return new Promise((fulfill) => {
      importer(modulePath, prev, fulfill);
    });
  };

  it('ignores modules which do not need special handling', () => {
    return runTest('other-scss', )
      .then(({file}) => {
        expect(file).to.eql('other-scss');
      });
  });

  describe('using package.json metadata', () => {
    it('reads the "main.css" field to find the right file', () => {
      return runTest('@namespaced-styles/grid')
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/@namespaced-styles/grid/dist/styles.css'))
        });
    });

    it('reads the "main.scss" field to find the right file', () => {
      return runTest('@namespaced-components/table')
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/@namespaced-components/table/dist/table.scss'))
        });
    });
  });

  describe('fallback behaviour', () => {
    it('guesses the path of the desired file is "index.scss" within the module folder', () => {
      return runTest('gridle')
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/gridle/index.scss'));
        });
    });

    it('uses explicit file path within module', () => {
      return runTest('gridle/index.scss')
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/gridle/index.scss'));
        });
    });

    it('uses explicit file path within module and assumes the file name ends with ".scss"', () => {
      return runTest('gridle/index')
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/gridle/index.scss'));
        });
    });
  });

  describe('sub-module loading', () => {
    it('resolves sub-modules', () => {
      return runTest('@namespaced-styles/colors', mockAbsolutePath('node_modules/@namespaced-styles/typography/index.scss'))
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/@namespaced-styles/typography/node_modules/@namespaced-styles/colors/index.scss'))
        });
    });

    it('uses root modules when sub-modules exist', () => {
      return runTest('@namespaced-components/table', mockAbsolutePath('node_modules/@namespaced-styles/typography/index.scss'))
        .then(({file}) => {
          expect(file).to.eql(mockAbsolutePath('node_modules/@namespaced-components/table/dist/table.scss'))
        });
    });
  });

  describe('error handling', () => {
    const consoleSandbox = sinon.sandbox.create();

    afterEach(() => {
      consoleSandbox.restore();
    });

    it('logs an error when it cannot load a module', () => {
      const prevPath = mockAbsolutePath('node_modules/@namespaced-styles/typography/index.scss');

      consoleSandbox.stub(global.console);
      return runTest('@namespaced-styles/non-existent', prevPath)
        .then(({file}) => {
          expect(file).to.eql('@namespaced-styles/non-existent');
          expect(global.console.error).to.have.been.calledOnce;

          const [message, error] = global.console.error.args[0];
          expect(message).to.eql(`Error loading module "@namespaced-styles/non-existent" in ${prevPath}`);
          expect(error).to.be.instanceOf(Error);
          consoleSandbox.restore();
        });
    });
  });
});