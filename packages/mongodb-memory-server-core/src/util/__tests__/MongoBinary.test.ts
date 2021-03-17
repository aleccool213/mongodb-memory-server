import * as tmp from 'tmp';
import os from 'os';
import MongoBinary, { MongoBinaryOpts } from '../MongoBinary';
import MongoBinaryDownload from '../MongoBinaryDownload';
import resolveConfig, { envName, ResolveConfigVariables } from '../resolveConfig';
import * as utils from '../utils';
import { DryMongoBinary } from '../DryMongoBinary';
import * as childProcess from 'child_process';

tmp.setGracefulCleanup();

const mockedPath = '/path/to/binary';
const mockGetMongodPath = jest.fn().mockResolvedValue(mockedPath);

jest.mock('../MongoBinaryDownload', () => {
  return jest.fn().mockImplementation(() => {
    return { getMongodPath: mockGetMongodPath };
  });
});

jest.mock('child_process');

describe('MongoBinary', () => {
  let tmpDir: tmp.DirResult;

  beforeEach(() => {
    tmpDir = tmp.dirSync({ prefix: 'mongo-mem-bin-', unsafeCleanup: true });
    DryMongoBinary.binaryCache.clear();
  });

  // cleanup
  afterEach(() => {
    tmpDir.removeCallback();
    (MongoBinaryDownload as jest.Mock).mockClear();
    mockGetMongodPath.mockClear();
    DryMongoBinary.binaryCache.clear();
  });

  describe('getPath', () => {
    it('should download binary and keep it in cache', async () => {
      const version = resolveConfig(ResolveConfigVariables.VERSION);
      utils.assertion(typeof version === 'string', new Error('Expected "version" to be an string'));
      const binPath = await MongoBinary.download({
        downloadDir: tmpDir.name,
        version,
        arch: 'x64',
        platform: 'linux',
        checkMD5: false,
      } as Required<MongoBinaryOpts>);

      // eg. /tmp/mongo-mem-bin-33990ScJTSRNSsFYf/mongodb-download/a811facba94753a2eba574f446561b7e/mongodb-macOS-x86_64-3.5.5-13-g00ee4f5/
      expect(MongoBinaryDownload).toHaveBeenCalledWith({
        downloadDir: tmpDir.name,
        platform: os.platform(),
        arch: os.arch(),
        version,
        checkMD5: false,
      });

      expect(mockGetMongodPath).toHaveBeenCalledTimes(1);

      const gotVersionPath = DryMongoBinary.binaryCache.get(version);
      expect(gotVersionPath).toBeDefined();
      expect(gotVersionPath).toEqual(binPath);
      expect(gotVersionPath).toEqual(mockedPath);
    });

    describe('systemBinary', () => {
      const sysBinaryPath = '/path/to/binary';
      beforeEach(() => {
        jest
          .spyOn(utils, 'pathExists') // mock this to be sure that "pathExists" is "true" for "sysBinaryPath"
          .mockImplementation((path) => Promise.resolve(path === sysBinaryPath));
        jest.spyOn(DryMongoBinary, 'getSystemPath').mockImplementation((v) => Promise.resolve(v)); // mock this so that no error comes up, because mock path actually dosnt exist
        jest.spyOn(MongoBinary, 'download'); // add spy to get call information
      });
      afterEach(() => {
        delete process.env[envName(ResolveConfigVariables.VERSION)];
        delete process.env[envName(ResolveConfigVariables.SYSTEM_BINARY)];
      });

      it('should return and check an SystemBinary', async () => {
        // Output taken from mongodb x64 for "ubuntu" version "4.0.20"
        // DO NOT INDENT THE TEXT
        jest.spyOn(childProcess, 'spawnSync').mockReturnValue(
          // @ts-expect-error Because "Buffer" is missing values from type, but they are not used in code, so its fine
          Buffer.from(`db version v4.0.20
git version: e2416422da84a0b63cde2397d60b521758b56d1b
OpenSSL version: OpenSSL 1.1.1f  31 Mar 2020
allocator: tcmalloc
modules: none
build environment:
    distmod: ubuntu1804
    distarch: x86_64
    target_arch: x86_64`)
        );
        process.env[envName(ResolveConfigVariables.VERSION)] = '4.0.20'; // set it explicitly to that version to test matching versions
        process.env[envName(ResolveConfigVariables.SYSTEM_BINARY)] = sysBinaryPath;

        const output = await MongoBinary.getPath();
        expect(childProcess.spawnSync).toHaveBeenCalledTimes(1);
        expect(MongoBinary.download).not.toHaveBeenCalled();
        expect(output).toBe(sysBinaryPath);
      });
    });
  });
});
