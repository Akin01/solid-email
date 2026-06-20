import { type SolidStyle, type StyleValue, styleObject } from '../../shared';

type PaddingType = StyleValue;

type PaddingResult = {
  'padding-top': number | undefined;
  'padding-right': number | undefined;
  'padding-bottom': number | undefined;
  'padding-left': number | undefined;
};

type RawPadding = {
  'padding-top': PaddingType;
  'padding-right': PaddingType;
  'padding-bottom': PaddingType;
  'padding-left': PaddingType;
};

/**
 * Converts padding values to `px` equivalents.
 * @example "1em" => 16
 */
export function convertToPx(value: PaddingType) {
  let px = 0;

  if (!value) return px;

  if (typeof value === 'number') return value;

  const matches = /^([\d.]+)(px|em|rem|%)$/.exec(value);

  if (matches && matches.length === 3) {
    const numValue = Number.parseFloat(matches[1] ?? '0');
    const unit = matches[2];

    switch (unit) {
      case 'px':
        return numValue;
      case 'em':
      case 'rem':
        px = numValue * 16;
        return px;
      case '%':
        px = (numValue / 100) * 600;
        return px;
      default:
        return numValue;
    }
  }

  return 0;
}

function parsePaddingValue(value: PaddingType): RawPadding {
  if (typeof value === 'number') {
    return {
      'padding-top': value,
      'padding-right': value,
      'padding-bottom': value,
      'padding-left': value,
    };
  }

  if (typeof value === 'string') {
    const values = value.trim().split(/\s+/);

    if (values.length === 1) {
      return {
        'padding-top': values[0],
        'padding-right': values[0],
        'padding-bottom': values[0],
        'padding-left': values[0],
      };
    }

    if (values.length === 2) {
      return {
        'padding-top': values[0],
        'padding-right': values[1],
        'padding-bottom': values[0],
        'padding-left': values[1],
      };
    }

    if (values.length === 3) {
      return {
        'padding-top': values[0],
        'padding-right': values[1],
        'padding-bottom': values[2],
        'padding-left': values[1],
      };
    }

    if (values.length === 4) {
      return {
        'padding-top': values[0],
        'padding-right': values[1],
        'padding-bottom': values[2],
        'padding-left': values[3],
      };
    }
  }

  return {
    'padding-top': undefined,
    'padding-right': undefined,
    'padding-bottom': undefined,
    'padding-left': undefined,
  };
}

/**
 * Parses padding shorthands to per-side px values.
 * @example "10px" => pt: 10, pr: 10, pb: 10, pl: 10
 */
export function parsePadding(properties: SolidStyle = {}): PaddingResult {
  let paddingTop: PaddingType;
  let paddingRight: PaddingType;
  let paddingBottom: PaddingType;
  let paddingLeft: PaddingType;

  for (const [property, value] of Object.entries(styleObject(properties))) {
    if (property === 'padding') {
      ({
        'padding-top': paddingTop,
        'padding-right': paddingRight,
        'padding-bottom': paddingBottom,
        'padding-left': paddingLeft,
      } = parsePaddingValue(value));
    } else if (property === 'padding-top') {
      paddingTop = value;
    } else if (property === 'padding-right') {
      paddingRight = value;
    } else if (property === 'padding-bottom') {
      paddingBottom = value;
    } else if (property === 'padding-left') {
      paddingLeft = value;
    }
  }

  return {
    'padding-top': paddingTop ? convertToPx(paddingTop) : undefined,
    'padding-right': paddingRight ? convertToPx(paddingRight) : undefined,
    'padding-bottom': paddingBottom ? convertToPx(paddingBottom) : undefined,
    'padding-left': paddingLeft ? convertToPx(paddingLeft) : undefined,
  };
}
