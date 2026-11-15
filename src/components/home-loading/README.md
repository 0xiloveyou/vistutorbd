# Home loading animations

`HomeLoading.jsx` renders the selected CSS-only animation while the home carousel loads.
Set `NEXT_PUBLIC_HOME_LOADING_TARGET` to `1`, `2`, or `3`; option `1` is the default.
The value is embedded in the client bundle, so restart or rebuild the frontend after changing it.

## References and licenses

- Option 1: the six-face comic loader from [Uiverse: bitter-dragon-32](https://uiverse.io/chase2k25/bitter-dragon-32), MIT License.
- Option 2: nested diamond rings inspired by [20essentials/project-000-455](https://github.com/20essentials/project-000-455), MIT License.
- Option 3: cloud and falling parachutes inspired by [Uiverse: calm-octopus-42](https://uiverse.io/toniflutter/calm-octopus-42), MIT License.

The animations are implemented locally in `HomeLoading.module.css`; the application does not load code or styles from those sites at runtime.
