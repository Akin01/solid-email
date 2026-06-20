import { type SolidStyle, type StyleValue, styleObject } from '../../shared';

type MarginValue = string | number | undefined;

type MarginResult = {
  'margin-top': MarginValue;
  'margin-right': MarginValue;
  'margin-bottom': MarginValue;
  'margin-left': MarginValue;
};

function parseMarginValue(value: StyleValue): MarginResult {
  if (typeof value === 'number') {
    return {
      'margin-top': value,
      'margin-right': value,
      'margin-bottom': value,
      'margin-left': value,
    };
  }

  if (typeof value === 'string') {
    const values = value.trim().split(/\s+/);

    if (values.length === 1) {
      return {
        'margin-top': values[0],
        'margin-right': values[0],
        'margin-bottom': values[0],
        'margin-left': values[0],
      };
    }

    if (values.length === 2) {
      return {
        'margin-top': values[0],
        'margin-right': values[1],
        'margin-bottom': values[0],
        'margin-left': values[1],
      };
    }

    if (values.length === 3) {
      return {
        'margin-top': values[0],
        'margin-right': values[1],
        'margin-bottom': values[2],
        'margin-left': values[1],
      };
    }

    if (values.length === 4) {
      return {
        'margin-top': values[0],
        'margin-right': values[1],
        'margin-bottom': values[2],
        'margin-left': values[3],
      };
    }
  }

  return {
    'margin-top': undefined,
    'margin-right': undefined,
    'margin-bottom': undefined,
    'margin-left': undefined,
  };
}

export function computeMargins(style: SolidStyle = {}): MarginResult {
  let result: MarginResult = {
    'margin-top': undefined,
    'margin-right': undefined,
    'margin-bottom': undefined,
    'margin-left': undefined,
  };

  for (const [property, value] of Object.entries(styleObject(style))) {
    if (property === 'margin') result = parseMarginValue(value);
    else if (property === 'margin-top')
      result['margin-top'] = value ?? undefined;
    else if (property === 'margin-right')
      result['margin-right'] = value ?? undefined;
    else if (property === 'margin-bottom')
      result['margin-bottom'] = value ?? undefined;
    else if (property === 'margin-left')
      result['margin-left'] = value ?? undefined;
  }

  return result;
}
