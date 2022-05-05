import t, { is, ok, same } from 'tst'
import parse from '../src/parse.js'


t('parse: common', t => {
  is(parse('1+1'), ['+', ['int', 1], ['int', 1]])
  is(parse('1.0+1.0'), ['+', ['float', 1], ['float', 1]])
  is(parse('a+b-c'), ['-',['+', 'a', 'b'],'c'])

  is(parse(`x([left], v)`), ['(','x',[',',['[','left'],'v']])
})

t('parse: identifiers', t => {
  // permit @#$_
  is(parse('a@a, _b#, c_c, $d$'), [',', 'a@a', '_b#','c_c','$d$'])

  // disregard casing
  is(parse('A, Bc, d_E'), [',', 'a', 'bc','d_e'])
})

t('parse: end operator precedence', t => {
  is(parse(`
    x() = 1+2.
  `), ['.',['=', ['(', 'x'], ['+', ['int',1], ['int',2]]]])

  is(parse(`
    a,b,c.
  `), ['.',[',','a','b','c']])

  is(parse(`
    x() = (1+2).
  `), ['.',['=', ['(', 'x'], ['(', ['+', ['int',1], ['int',2]]]]])

  is(parse(`
    x() = (1+2.)
  `), ['=', ['(', 'x'], ['(',['.', ['+', ['int',1], ['int',2]]]]])

  is(parse(`
    x() = (1+2.).
  `), ['.',['=', ['(', 'x'], ['(',['.',['+', ['int',1], ['int',2]]]]]])

  is(parse(`
    x() = (a?b.;c)
  `), ['=', ['(', 'x'], ['(',[';', ['?','a',['.','b']],'c']]])

  is(parse(`
    x() = (a?b.c)
  `), ['=', ['(', 'x'], ['(',['?','a',['.','b','c']]]])
})

t('parse: semicolon', t => {
  // TODO: semic tests
  // is(parse(`
  //   x() = 1+2;
  // `), [';',['=', ['(', 'x'], ['+', ['float',1], ['float',2]]], null])

  // is(parse(`
  //   a,b,c;
  // `), [';',[',','a','b','c'], null])
})

t('parse: import', t => {
  is(parse(`@'math'`), ['@', ['\'','math']])
  is(parse(`@'math#a'`), ['@', ['\'','math#a']])
  is(parse(`@'math#a,b,c'`), ['@', ['\'','math#a,b,c']])
})

t('parse: sine gen', t => {
  // console.log(parse(`
  //   sine(freq) = (
  //     *phase=0;
  //     phase += freq * pi2 / sampleRate;
  //     [sin(phase)].
  // ).`)[1][2][1]);
  is(parse(`
    sine(freq) = (
      *phase=0;
      phase += freq * pi2 / sampleRate;
      [sin(phase)].
  ).`), [
    '.', ['=',[
      '(', 'sine', 'freq'
    ], ['(',
        [';',
          ['=',['*', 'phase'],['int',0]],
          ['+=', 'phase', ['/', ['*', 'freq', 'pi2'], 'samplerate']],
          ['.',['[',['(', 'sin','phase']]]
        ]
      ]
    ]
  ])
})


t.skip('parse: audio-gain', t => {
  is(parse(`
    range = 0..1000;

    gain([left], volume <- range) = [left * volume];
    gain([left, right], volume <- range) = [left * volume, right * volume];
    //gain([..channels], volume <- range) = [..channels * volume];

    gain.
  `), [';',
    ['=', 'range', ['..', ['int',0], ['int',1000]]],
    ['=', ['(', 'gain', [',', ['[', 'left'], ['<-', 'volume', 'range']]], ['[', ['*', 'left', 'volume']]],

    ['=', ['(', 'gain', [',', ['[', [',','left','right']], ['<-', 'volume', 'range']]], ['[', [',',['*', 'left', 'volume'],['*', 'right', 'volume']]]],
    ['.', 'gain']
  ])
})
