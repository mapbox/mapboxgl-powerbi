### Version 1.0.1 (2016-03-07) ###

- Update the source-map dependency.
- Reduce the npm package size by only including needed files.


### Version 1.0.0 (2015-02-26) ###

- Update the source-map dependency.


### Version 0.4.0 (2014-08-16) ###

- Updated the source-map dependency from a fork to 0.1.38. The fork supported
  ancient `\r` newlines, while the official package does not.
  (Backwards-incompatible change (but I doubt anyone will notice).)


### Version 0.3.0 (2014-06-19) ###

- Updated source-map-dummy to 0.3.0, which means slightly different mappings.
  (Backwards-incompatible change.)


### Version 0.2.0 (2014-06-05) ###

- Allow passing a source map as a string and anything with a `.toJSON()` method
  (such as a `SourceMapGenerator`) as well as an object.
- Rename `file.content` to `file.code`, to be consistent with
  `SourceNode.toStringWithSourceMap()` and rework (`css.stringify`). After all,
  in reality the content is going to be code, so we might just as well call it
  that. “code” is also shorter than “content”. (Backwards-incompatible change.)


### Version 0.1.0 (2014-03-22) ###

- Initial release.
