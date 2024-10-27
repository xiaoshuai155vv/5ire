import {
  Button,
  Field,
  Input,
  InputOnChangeData,
} from '@fluentui/react-components';
import useToast from 'hooks/useToast';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import useKnowledgeStore from 'stores/useKnowledgeStore';
import { isBlank } from 'utils/validators';

export default function CollectionForm() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getCollection, updateCollection } = useKnowledgeStore();
  const { notifyInfo, notifySuccess, notifyError } = useToast();
  const { createCollection } = useKnowledgeStore();
  const [name, setName] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  useEffect(()=>{
    const loadCollection = async () => {
      if(id){
        const collection = await getCollection(id);
        if (!collection) {
          notifyError(t('Knowledge.Form.Notification.CollectionNotFound'));
          return;
        }
        setName(collection.name);
        setMemo(collection.memo||'');
      }
    }
    loadCollection();
  },[id])

  const onSave = async () => {
    if (isBlank(name)) {
      notifyInfo(t('Knowledge.Notification.NameRequired'));
      return;
    }
    if (id) {
      updateCollection({
        id,
        name,
        memo,
      });
      notifySuccess(t('Knowledge.Notification.CollectionUpdated'));
    } else {
      createCollection({
        name,
        memo,
      });
      notifySuccess(t('Knowledge.Notification.CollectionCreated'));
    }
    navigate(-1);
  };
  return (
    <div className="page h-full">
      <div className="page-top-bar"></div>
      <div className="page-header flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl flex-shrink-0 mr-6">
            {t('Knowledge.Page.Title.Collection')}
          </h1>
          <div className="flex items-center justify-end gap-2">
            <Button appearance="subtle" onClick={() => navigate(-1)}>
              {t('Common.Cancel')}
            </Button>
            <Button appearance="primary" onClick={onSave}>
              {t('Common.Save')}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2.5 pb-12 h-full -mr-5 overflow-y-auto">
        <div className="mr-5 flex flex-col">
          <div className="mb-2.5">
            <Field label={t('Common.Name')}>
              <Input
                value={name}
                placeholder={t('Common.Required')}
                onChange={(
                  _: ChangeEvent<HTMLInputElement>,
                  data: InputOnChangeData
                ) => setName(data.value || '')}
              />
            </Field>
          </div>
          <div className="mb-2.5">
            <Field label={t('Common.Memo')}>
              <Input
                value={memo}
                placeholder={t('Common.Optional')}
                onChange={(
                  _: ChangeEvent<HTMLInputElement>,
                  data: InputOnChangeData
                ) => setMemo(data.value || '')}
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
