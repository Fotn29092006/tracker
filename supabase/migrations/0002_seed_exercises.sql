-- System exercise catalogue (~58). muscle_distribution keys must match
-- MuscleId in lib/types.ts. Sum ≈ 100; partial credit is fine.
insert into public.exercises (user_id, name, category, equipment, muscle_distribution, is_system) values
  -- CHEST
  (null, 'Жим лёжа со штангой',          'push',     'barbell',    '{"chest":50,"triceps":25,"shoulders_front":25}'::jsonb, true),
  (null, 'Жим гантелей лёжа',            'push',     'dumbbell',   '{"chest":55,"triceps":20,"shoulders_front":25}'::jsonb, true),
  (null, 'Жим лёжа на наклонной',        'push',     'barbell',    '{"chest":45,"shoulders_front":30,"triceps":25}'::jsonb, true),
  (null, 'Жим гантелей на наклонной',    'push',     'dumbbell',   '{"chest":50,"shoulders_front":25,"triceps":25}'::jsonb, true),
  (null, 'Жим на отрицательном наклоне', 'push',     'barbell',    '{"chest":60,"triceps":25,"shoulders_front":15}'::jsonb, true),
  (null, 'Отжимания',                    'push',     'bodyweight', '{"chest":55,"triceps":25,"shoulders_front":15,"abs":5}'::jsonb, true),
  (null, 'Отжимания на брусьях',         'push',     'bodyweight', '{"chest":45,"triceps":40,"shoulders_front":15}'::jsonb, true),
  (null, 'Разводка гантелей лёжа',       'push',     'dumbbell',   '{"chest":75,"shoulders_front":25}'::jsonb, true),
  (null, 'Кроссовер (cable fly)',        'push',     'cable',      '{"chest":80,"shoulders_front":20}'::jsonb, true),
  -- BACK / LATS
  (null, 'Подтягивания',                 'pull',     'bodyweight', '{"lats":50,"biceps":25,"shoulders_rear":15,"forearms":10}'::jsonb, true),
  (null, 'Подтягивания узким хватом',    'pull',     'bodyweight', '{"lats":40,"biceps":35,"shoulders_rear":15,"forearms":10}'::jsonb, true),
  (null, 'Подтягивания с отягощением',   'pull',     'bodyweight', '{"lats":50,"biceps":25,"shoulders_rear":15,"forearms":10}'::jsonb, true),
  (null, 'Тяга штанги в наклоне',        'pull',     'barbell',    '{"lats":40,"shoulders_rear":25,"biceps":20,"traps":10,"lower_back":5}'::jsonb, true),
  (null, 'Тяга гантели в наклоне',       'pull',     'dumbbell',   '{"lats":50,"shoulders_rear":20,"biceps":20,"traps":10}'::jsonb, true),
  (null, 'Тяга верхнего блока',          'pull',     'cable',      '{"lats":60,"biceps":25,"shoulders_rear":15}'::jsonb, true),
  (null, 'Тяга нижнего блока',           'pull',     'cable',      '{"lats":50,"shoulders_rear":25,"biceps":20,"traps":5}'::jsonb, true),
  (null, 'Шраги со штангой',             'pull',     'barbell',    '{"traps":80,"forearms":20}'::jsonb, true),
  (null, 'Шраги с гантелями',            'pull',     'dumbbell',   '{"traps":75,"forearms":25}'::jsonb, true),
  -- SHOULDERS
  (null, 'Жим штанги стоя',              'push',     'barbell',    '{"shoulders_front":50,"triceps":25,"traps":15,"abs":10}'::jsonb, true),
  (null, 'Жим гантелей стоя',            'push',     'dumbbell',   '{"shoulders_front":50,"triceps":25,"traps":15,"abs":10}'::jsonb, true),
  (null, 'Жим Арнольда',                 'push',     'dumbbell',   '{"shoulders_front":60,"shoulders_rear":15,"triceps":15,"traps":10}'::jsonb, true),
  (null, 'Махи в стороны',               'push',     'dumbbell',   '{"shoulders_front":80,"traps":20}'::jsonb, true),
  (null, 'Махи перед собой',             'push',     'dumbbell',   '{"shoulders_front":70,"chest":30}'::jsonb, true),
  (null, 'Махи в наклоне',               'pull',     'dumbbell',   '{"shoulders_rear":70,"traps":20,"lats":10}'::jsonb, true),
  (null, 'Обратная разводка в тренажёре','pull',     'machine',    '{"shoulders_rear":75,"traps":25}'::jsonb, true),
  -- ARMS
  (null, 'Подъём штанги на бицепс',      'pull',     'barbell',    '{"biceps":80,"forearms":20}'::jsonb, true),
  (null, 'Подъём гантелей на бицепс',    'pull',     'dumbbell',   '{"biceps":80,"forearms":20}'::jsonb, true),
  (null, 'Молотки',                      'pull',     'dumbbell',   '{"biceps":60,"forearms":40}'::jsonb, true),
  (null, 'Концентрированные сгибания',   'pull',     'dumbbell',   '{"biceps":90,"forearms":10}'::jsonb, true),
  (null, 'Французский жим',              'push',     'barbell',    '{"triceps":80,"shoulders_front":20}'::jsonb, true),
  (null, 'Разгибания на блоке',          'push',     'cable',      '{"triceps":90,"forearms":10}'::jsonb, true),
  (null, 'Жим лёжа узким хватом',        'push',     'barbell',    '{"triceps":50,"chest":30,"shoulders_front":20}'::jsonb, true),
  (null, 'Брусья (трицепс акцент)',      'push',     'bodyweight', '{"triceps":50,"chest":35,"shoulders_front":15}'::jsonb, true),
  -- LEGS — QUADS
  (null, 'Присед со штангой',            'legs',     'barbell',    '{"quads":45,"glutes":30,"hamstrings":15,"lower_back":10}'::jsonb, true),
  (null, 'Фронтальный присед',           'legs',     'barbell',    '{"quads":55,"glutes":25,"lower_back":10,"abs":10}'::jsonb, true),
  (null, 'Жим ногами',                   'legs',     'machine',    '{"quads":60,"glutes":30,"hamstrings":10}'::jsonb, true),
  (null, 'Гак-присед',                   'legs',     'machine',    '{"quads":60,"glutes":25,"hamstrings":15}'::jsonb, true),
  (null, 'Разгибания ног сидя',          'legs',     'machine',    '{"quads":100}'::jsonb, true),
  (null, 'Выпады с гантелями',           'legs',     'dumbbell',   '{"quads":40,"glutes":35,"hamstrings":25}'::jsonb, true),
  -- LEGS — POSTERIOR
  (null, 'Румынская тяга',               'legs',     'barbell',    '{"hamstrings":50,"glutes":30,"lower_back":15,"traps":5}'::jsonb, true),
  (null, 'Становая тяга',                'compound', 'barbell',    '{"hamstrings":25,"glutes":25,"lower_back":25,"lats":15,"traps":10}'::jsonb, true),
  (null, 'Сгибания ног лёжа',            'legs',     'machine',    '{"hamstrings":100}'::jsonb, true),
  (null, 'Сгибания ног сидя',            'legs',     'machine',    '{"hamstrings":100}'::jsonb, true),
  -- LEGS — GLUTES
  (null, 'Болгарские сплиты',            'legs',     'dumbbell',   '{"quads":35,"glutes":45,"hamstrings":20}'::jsonb, true),
  (null, 'Тяга бёдрами (hip thrust)',    'legs',     'barbell',    '{"glutes":75,"hamstrings":25}'::jsonb, true),
  (null, 'Ягодичный мост',               'legs',     'bodyweight', '{"glutes":80,"hamstrings":20}'::jsonb, true),
  -- CALVES
  (null, 'Подъёмы на носки стоя',        'legs',     'machine',    '{"calves":100}'::jsonb, true),
  (null, 'Подъёмы на носки сидя',        'legs',     'machine',    '{"calves":100}'::jsonb, true),
  -- CORE
  (null, 'Планка',                       'core',     'bodyweight', '{"abs":50,"obliques":30,"lower_back":20}'::jsonb, true),
  (null, 'Боковая планка',               'core',     'bodyweight', '{"obliques":70,"abs":20,"lower_back":10}'::jsonb, true),
  (null, 'Подъём ног в висе',            'core',     'bodyweight', '{"abs":70,"obliques":15,"forearms":15}'::jsonb, true),
  (null, 'Скручивания',                  'core',     'bodyweight', '{"abs":90,"obliques":10}'::jsonb, true),
  (null, 'Велосипед',                    'core',     'bodyweight', '{"abs":50,"obliques":50}'::jsonb, true),
  (null, 'Колесо для пресса',            'core',     'other',      '{"abs":60,"lats":25,"shoulders_front":15}'::jsonb, true),
  -- MISC / COMPOUND
  (null, 'Берпи',                        'compound', 'bodyweight', '{"quads":30,"chest":25,"abs":20,"shoulders_front":15,"calves":10}'::jsonb, true),
  (null, 'Махи гирей',                   'compound', 'kettlebell', '{"glutes":40,"hamstrings":30,"lower_back":15,"shoulders_front":10,"abs":5}'::jsonb, true),
  (null, 'Гиперэкстензия',               'core',     'bodyweight', '{"lower_back":70,"glutes":20,"hamstrings":10}'::jsonb, true)
on conflict do nothing;
