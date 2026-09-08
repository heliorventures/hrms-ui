import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

import { CreateAnnouncementModalForm, SubmitLabel } from './CreateAnnouncementModal.Form';
import type { CreateAnnouncementModalProps } from './CreateAnnouncementModal.types';
import { useCreateAnnouncementModalController } from './CreateAnnouncementModal.useController';
import { useNotificationOwnerKey } from './useNotificationOwnerKey';

const AnnouncementModalContent = (props: CreateAnnouncementModalProps) => {
  const controller = useCreateAnnouncementModalController(props);

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={controller.close}
      isDismissible={!controller.submitting}
      title={controller.hrCompose ? 'New announcement (HR)' : 'New team post'}
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={controller.close}
            disabled={controller.submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-announcement-form"
            variant="primary"
            disabled={controller.submitting || controller.hrAudienceControlsDisabled}
          >
            <SubmitLabel hrCompose={controller.hrCompose} submitting={controller.submitting} />
          </Button>
        </>
      }
    >
      <CreateAnnouncementModalForm controller={controller} />
    </Modal>
  );
};

const CreateAnnouncementModal = (props: CreateAnnouncementModalProps) => {
  const owner = useNotificationOwnerKey();
  return props.isOpen ? <AnnouncementModalContent key={owner} {...props} /> : null;
};

export default CreateAnnouncementModal;
