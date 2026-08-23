import Modal from '../../components/common/Modal';

import { CreateAnnouncementModalForm } from './CreateAnnouncementModal.Form';
import type { CreateAnnouncementModalProps } from './CreateAnnouncementModal.types';
import { useCreateAnnouncementModalController } from './CreateAnnouncementModal.useController';

const CreateAnnouncementModal = (props: CreateAnnouncementModalProps) => {
  const controller = useCreateAnnouncementModalController(props);

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={controller.close}
      title={controller.hrCompose ? 'New announcement (HR)' : 'New team post'}
      size="xl"
    >
      <CreateAnnouncementModalForm controller={controller} />
    </Modal>
  );
};

export default CreateAnnouncementModal;
