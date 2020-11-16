package org.fhi360.lamis.modules.patient.service.providers;

import com.foreach.across.core.annotations.Exposed;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;

import java.util.Collections;
import java.util.List;


@Exposed
public interface PatientObservationViewProvider {
    boolean applicableTo(Patient patient);

    String getName();

    String getPath();

    default String getTooltip() {
        return "";
    }

    default String getIcon() {
        return "";
    }

    default List<String> getRoles() {
        return Collections.emptyList();
    }
}
