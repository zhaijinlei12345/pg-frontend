import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useDictData } from '../hooks/useDict';

interface DictSelectProps extends Omit<SelectProps, 'options' | 'loading'> {
  dictCode: string;
}

/**
 * 通用字典下拉组件
 * 用法: <DictSelect dictCode="role" />
 */
export default function DictSelect({ dictCode, ...rest }: DictSelectProps) {
  const { data, loading } = useDictData(dictCode);

  const options = (data?.entries || []).map(e => ({
    value: e.key,
    label: e.label,
  }));

  return (
    <Select
      loading={loading}
      options={options}
      placeholder={`请选择${data?.name || ''}`}
      {...rest}
    />
  );
}
