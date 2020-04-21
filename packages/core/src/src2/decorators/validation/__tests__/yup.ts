import * as yup from 'yup';
import assert from 'assert';

describe('yup', () => {
  it('should support string', async () => {
    const schema = yup
      .string()
      .label('某个必填字段')
      .required('${label}必须存在')
      .min(1, '至少大于等于${min}');
    try {
      await schema.validate('', { abortEarly: false });
    } catch (e) {
      let error: yup.ValidationError = e;

      assert.deepEqual({ ...error }, []);
    } finally {
      // console.log(schema.describe().tests);
    }

    const schema2 = yup.object().shape({
      fly: schema
    });

    try {
      await schema2.validate({ fly: '' }, { abortEarly: false });
    } catch (e) {
      let error: yup.ValidationError = e;

      assert.deepEqual(error.errors, []);
    } finally {
      // console.log(schema2.describe());
    }
  });
});
