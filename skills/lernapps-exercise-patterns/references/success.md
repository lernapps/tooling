# How an exercise checks success

## Property, not model solution

- Check what the text asks: "a fraction equal to 1/2" accepts 2/4, 3/6; "a conductor" every conductor.
- "Order the steps" only where the order is fixed.
- Type cannot accept every correct answer (`ordering` with free order, `single-choice` with two defensible options)
  → other type or other text.

## Note first (plan or guide)

- Answers that fulfil the text, incl. correct ones other than yours.
- Typical wrong answers.
- Feedback for each.

## Feedback on a wrong answer

- Every wrong option: `info` saying why it does not fit.
- `number`, `generated`: 2–3 common mistakes under `mistakes`, each with message (`generated`: expressions over
  the variables).
- Optional `hint`: where to look, not the answer.
- Component logic: right/wrong plus a short reason.

## Examples and tests

- `examples.accepted`: other correct answers the text allows; `examples.rejected`: typical wrong ones. The build runs
  them through the real check; learners never see them.
- Accepted example fails → the exercise checks the wrong thing: change type or check, not the example.
- Component test: equivalent correct answers and typical wrong ones, not only the model solution.
- Exercise component: `about.mistakes` from the same wrong answers as `examples.rejected`; `describe` states the task
  exactly as shown for that task number (a tutor reads only that).
